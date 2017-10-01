const KoaRouter = require('koa-router');
const playerSportsRouter = require('./playerSports');
const playerTeamsRouter = require('./playerTeams');

const router = new KoaRouter();

// HACK: this is copied from models.players
// (how to access those values using models.player? look up the docs)
const genders = ["masculino", "femenino"];

/** Calculate the age of the player given his birthday**/
function calculateAge(birthday){
  // OPTIMIZE this function? dates can be substracted
  const today = new Date();

  const year = birthday.substring(0,4);
  const month = birthday.substring(5,7);
  const day = birthday.substring(8,10);

  const dateBirthday = new Date(year, month-1, day);
  const diff =  today - dateBirthday;
  const age = Math.floor(diff/(1000*60*60*24*365.25));
  return age;
}

/** Extract the User parameters from a params object (such as request.body) **/
function getUserParams(params){
  return {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    role: 'player',
  };
}

/** Extract the Player parameters from a params object (such as request.body) **/
function getPlayerParams(params){
  return {
    gender: params.gender || '', // HACK: Avoids null value reaching the model, ugly error message (the notEmpty msg should be used)
    birthday: params.birthday,
  };
}

/** Load the player and the user from the database **/
async function getPlayerAndUser(ctx, playerId){
  // REVIEW: apparently not all calls of this need both user and player
  const player = await ctx.orm.player.findById(playerId);
  const user = player && await player.getUser();
  return { player, user };
}

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();
  await ctx.render('players/index', {
    players,
    playerPath: player => ctx.router.url('player', { id: player.id }),
  });
});

router.get('playerNew', '/new', async (ctx) => {
  if (!ctx.state.requireNoLogin(ctx)) return;

  const user = ctx.orm.user.build(); // (ctx.request.body);
  const player = ctx.orm.player.build(); // (ctx.request.body);

  await ctx.render('players/new', {
    player,
    genders,
    submitPlayerPath: ctx.router.url('playerCreate'),
    cancelPath : ctx.router.url('players'),
  });
});

router.post('playerCreate', '/', async (ctx) => {
  if (!ctx.state.requireNoLogin(ctx)) return;

  const userParams = getUserParams(ctx.request.body);
  const playerParams = getPlayerParams(ctx.request.body);

  let user = null;
  try {
    user = await ctx.orm.user.create(userParams);
    playerParams.userId = user.id;
    const player = await ctx.orm.player.create(playerParams);
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    if (user){ // User was created correctly, delete it
      // REVIEW: you may avoid saving to the DB and then deleting by using
      // build() and then save() methods on user and player
      user.destroy();
    }

    await ctx.render('players/new', {
      player: ctx.orm.player.build(ctx.request.body),
      genders,
      errors: validationError.errors,
      submitPlayerPath: ctx.router.url('playerCreate'),
      cancelPath: ctx.router.url('players'),
    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const { player, user } = await getPlayerAndUser(ctx, ctx.params.id);

  if (!ctx.state.requireModifyPermission(ctx, user)) return;

  await ctx.render('players/edit', {
    player,
    genders,
    submitPlayerPath: ctx.router.url('playerUpdate', player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPath: ctx.router.url('player', { id: player.id }),
  });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const { player, user } = await getPlayerAndUser(ctx, ctx.params.id);

  if (!ctx.state.requireModifyPermission(ctx, user)) return;

  const userParams = getUserParams(ctx.request.body);
  const playerParams = getPlayerParams(ctx.request.body);

  try {
    await user.update(userParams);
    await player.update(playerParams);
    ctx.redirect(ctx.router.url('player', { id: player.id }));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player,
      genders,
      errors: validationError.errors,
      submitPlayerPath: ctx.router.url('playerUpdate', player.id),
      deletePlayerPath: ctx.router.url('playerDelete', player.id),
      cancelPath: ctx.router.url('player', { id: player.id }),
    });
  }
});

router.get('player', '/:id', async (ctx) => {
  const { player, user } = await getPlayerAndUser(ctx, ctx.params.id);

  const playerSports = await player.getSports();
  const playerTeams = await player.getTeams();
  const playerAge = calculateAge(player.birthday);

  await ctx.render('players/show', {
    hasModifyPermission: ctx.state.hasModifyPermission(ctx, user),
    player,
    playerAge,
    playerSports,
    playerTeams,
    editPlayerPath: ctx.router.url('playerEdit', player.id),
    getSportPath: (sport) => ctx.router.url('sport', sport.id),
    getTeamPath: (team) => ctx.router.url('team', team.id),
    newPlayerTeamPath: ctx.router.url('playerTeamNew', { playerId: player.id } ),
    editPlayerTeamPath: (team) => ctx.router.url('playerTeamEdit', {
      playerId: player.id,
      id: team.id
    }),
    newPlayerSportPath: ctx.router.url('playerSportNew', { playerId: player.id } ),
    editPlayerSportPath: (sport) => ctx.router.url('playerSportEdit', {
      playerId: player.id,
      id: sport.id }
    ),
    playersPath: ctx.router.url('players'),
  });
});

router.delete('playerDelete', '/:id', async (ctx) => {
  const { player, user } = await getPlayerAndUser(ctx, ctx.params.id);

  if (!ctx.state.requireModifyPermission(ctx, user)) return;

  await user.destroy(); // NOTE: player.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('players'));
});

router.use(
  '/:playerId/teams',
  async (ctx, next) => {
    const { player, user } = await getPlayerAndUser(ctx, ctx.params.playerId);

    if (!ctx.state.requireModifyPermission(ctx, user)) return;

    ctx.state.teams = await ctx.orm.team.findAll();
    ctx.state.player = player;
    ctx.state.playerTeams = await ctx.state.player.getTeams();
    await next();
  },
  playerTeamsRouter.routes(),
);

// router.use(
//   '/:playerId/sports',
//   async (ctx, next) => {
//     const { player, user } = await getPlayerAndUser(ctx, ctx.params.playerId);
//
//     if (!ctx.state.requireModifyPermission(ctx, user)) return;
//
//     ctx.state.sports = await ctx.orm.sport.findAll();
//     ctx.state.player = player;
//     ctx.state.playerSports = await ctx.state.player.getSports();
//     await next();
//   },
//   playerSportsRouter.routes(),
// );

module.exports = router;
