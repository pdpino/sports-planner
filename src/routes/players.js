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

  // console.log("TYPE OF birthday", typeof(birthday));

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

/*
 * Merge a player and a user to an object with the important attributes
 * This method is only used to render a view
 **/
function mergePlayerUser(user, player){
  // HACK: can't use Object.assign because orm objects have the dataValue property
  return {
    id: player.id,
    gender: player.gender,
    birthday: player.birthday,
    isNewRecord: player.isNewRecord,
    email: user.email,
    photo: user.photo,
    firstName: user.firstName,
    lastName: user.lastName,
    password: user.password,
  };
}



/** Boolean indicating if the user has modify permission **/
function has_modify_permission(ctx, user){
  return ctx.session.userId == user.id;
}

/** Boolean indicating if there is an user logged in**/
function is_logged_in(ctx){
  return Boolean(ctx.session.userId);
}

/** If the user doesn't have modify permissions it will be redirected to home **/
function require_modify_permission(ctx, user){
  if(!has_modify_permission(ctx, user)){
    console.log("NOTICE: YOU DON'T HAVE MODIFY PERMISSION");
    // TODO: send message to the user
    ctx.redirect('/');

    return false; // Require failed
  }
  return true; // Require passed
}

/** If can't signup, redirect to somewhere **/
function require_no_signup(ctx){
  if(is_logged_in(ctx)){ // There is already an user logged in
    console.log("NOTICE: can't signup if you are already logged in");
    // TODO: show message to the user
    ctx.redirect('/');
    return false; // Require failed
  }

  return true; // Require passed
}

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();
  for(let i = 0; i < players.length; i++){
    const user = await players[i].getUser(); // REVIEW: avoid DB query?
    players[i] = mergePlayerUser(user, players[i]);
  }
  await ctx.render('players/index', {
    players,
    playerPath: player => ctx.router.url('player', { id: player.id }),
    newPlayerPath: ctx.router.url('playerNew'),
  });
});

router.get('playerNew', '/new', async (ctx) => {
  if (!require_no_signup(ctx)) return;

  const user = ctx.orm.user.build(ctx.request.body);
  const player = ctx.orm.player.build(ctx.request.body);
  await ctx.render('players/new', {
    player: mergePlayerUser(user, player),
    genders,
    submitPlayerPath: ctx.router.url('playerCreate'),
    cancelPath : ctx.router.url('players'),
  });
});

router.post('playerCreate', '/', async (ctx) => {
  if (!require_no_signup(ctx)) return;

  const userParams = getUserParams(ctx.request.body);
  const playerParams = getPlayerParams(ctx.request.body);
  try {
    const user = await ctx.orm.user.create(userParams);
    playerParams.userId = user.id;
    const player = await ctx.orm.player.create(playerParams);
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
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
  const player = await ctx.orm.player.findById(ctx.params.id);
  const user = await ctx.orm.user.findById(player.userId);

  if (!require_modify_permission(ctx, user)) return;

  await ctx.render('players/edit', {
    player: mergePlayerUser(user, player),
    genders,
    submitPlayerPath: ctx.router.url('playerUpdate', player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPath: ctx.router.url('player', { id: player.id }),
  });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  const user = await ctx.orm.user.findById(player.userId);

  if (!require_modify_permission(ctx, user)) return;

  const userParams = getUserParams(ctx.request.body);
  const playerParams = getPlayerParams(ctx.request.body);
  try {
    await user.update(userParams);
    await player.update(playerParams);
    ctx.redirect(ctx.router.url('player', { id: player.id }));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player: mergePlayerUser(user, player),
      genders,
      errors: validationError.errors,
      submitPlayerPath: ctx.router.url('playerUpdate', player.id),
      deletePlayerPath: ctx.router.url('playerDelete', player.id),
      cancelPath: ctx.router.url('player', { id: player.id }),
    });
  }
});

router.get('player', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  const user = await player.getUser();
  const playerSports = await player.getSports();
  const playerTeams = await player.getTeams();
  const playerAge = calculateAge(player.birthday);

  await ctx.render('players/show', {
    hasModifyPermission: has_modify_permission(ctx, user),
    player: mergePlayerUser(user, player),
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
  const player = await ctx.orm.player.findById(ctx.params.id);
  const user = await ctx.orm.user.findById(player.userId);

  if (!require_modify_permission(ctx, user)) return;

  await user.destroy(); // NOTE: player.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('players'));
});

router.use(
  '/:playerId/teams',
  async (ctx, next) => {
    const player = await ctx.orm.player.findById(ctx.params.playerId);
    const user = await player.getUser();

    if (!require_modify_permission(ctx, user)) return;

    ctx.state.teams = await ctx.orm.team.findAll();
    ctx.state.player = player;
    ctx.state.playerTeams = await ctx.state.player.getTeams();
    await next();
  },
  playerTeamsRouter.routes(),
);

router.use(
  '/:playerId/sports',
  async (ctx, next) => {
    const player = await ctx.orm.player.findById(ctx.params.playerId);
    const user = await player.getUser();

    if (!require_modify_permission(ctx, user)) return;

    ctx.state.sports = await ctx.orm.sport.findAll();
    ctx.state.player = player;
    ctx.state.playerSports = await ctx.state.player.getSports();
    await next();
  },
  playerSportsRouter.routes(),
);

module.exports = router;
