const KoaRouter = require('koa-router');
const playerSportsRouter = require('./playerSports');
const playerTeamsRouter = require('./playerTeams');

const router = new KoaRouter();

/** Calculate the age of the player given his birthday**/
function calculateAge(birthday){
  const today = new Date();

  const year = birthday.substring(0,4);
  const month = birthday.substring(5,7);
  const day = birthday.substring(8,10);

  const dateBirthday = new Date(year, month-1, day);
  const diff =  today - dateBirthday;
  const age = Math.floor (diff/(1000*60*60*24*365.25));
  return age;
}

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();
  await ctx.render('players/index', {
    players,
    playerPath: player => ctx.router.url('playerShow', { id: player.id }),
    newPlayerPath: ctx.router.url('playerNew'),
   });
});

router.post('playerCreate', '/', async (ctx) => {
  try {
    const player = await ctx.orm.player.create(ctx.request.body);
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    await ctx.render('players/new', {
      player: ctx.orm.player.build(ctx.request.body),
      errors: validationError.errors,
      submitPlayerPath: ctx.router.url('playerCreate'),
      cancelPath: ctx.router.url('players'),
    });
  }
});

router.get('playerNew', '/new', async (ctx) => {
  const player= ctx.orm.player.build();
  await ctx.render('players/new', {
    player,
    submitPlayerPath: ctx.router.url('playerCreate'),
    cancelPath : ctx.router.url('players'),
  });
});

router.get('playerShow', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  const playSports = await player.getSports();
  const memberofTeams = await player.getTeams();
  const playerAge = calculateAge(player.age);
  await ctx.render('players/show', {
    player,
    playSports,
    playerAge,
    memberofTeams,
    editPlayerPath: ctx.router.url('playerEdit',player.id),
    cancelPlayerPath: ctx.router.url('players'),
    editPlayerTeamPath: (team) => ctx.router.url('playerTeamEdit', { playerId: player.id, id: team.id } ),
    editPlayerSportPath: (sport) => ctx.router.url('playerSportEdit', {
      playerId: player.id,
      id: sport.id }
    ),
    createPlayerTeamsPath: ctx.router.url('playerTeamNew', { playerId: player.id } ),
    createPlayerSportsPath: ctx.router.url('playerSportNew', { playerId: player.id } ),
    playersPath: ctx.router.url('players'),
  });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  try {
    await player.update(ctx.request.body);
    ctx.redirect(ctx.router.url('playerShow', { id: player.id }));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player,
      teams: await ctx.orm.team.findAll(),
      errors: validationError.errors,
      submitPlayerPath: ctx.router.url('playerUpdate', player.id),
      deletePlayerPath: ctx.router.url('playerDelete', player.id),
      cancelPath: ctx.router.url('playerShow', player.id),
      editPlayerTeamsPath: ctx.router.url('playerTeams',player.id),
    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  const teams = await ctx.orm.team.findAll();
  const Playerteams = await player.getTeams();
  await ctx.render('players/edit', {
    player,
    teams,
    Playerteams,
    submitPlayerPath: ctx.router.url('playerUpdate', player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPath: ctx.router.url('playerShow', player.id),
    editPlayerTeamsPath: ctx.router.url('playerTeams',player.id),
  });
});

router.delete('playerDelete', '/:id', async (ctx) => {
   const player = await ctx.orm.player.findById(ctx.params.id);
   await player.destroy();
   ctx.redirect(ctx.router.url('players'));
 });



  router.use(
 '/:playerId/teams',
 async (ctx, next) => {
   ctx.state.teams= await ctx.orm.team.findAll();
   ctx.state.player = await ctx.orm.player.findById(ctx.params.playerId);
   ctx.state.memberofTeams = await ctx.state.player.getTeams();
   await next();
 },
 playerTeamsRouter.routes(),
);

router.use(
 '/:playerId/sports',
 async (ctx, next) => {
   ctx.state.sports = await ctx.orm.sport.findAll();
   ctx.state.player = await ctx.orm.player.findById(ctx.params.playerId);
   ctx.state.playSports = await ctx.state.player.getSports();
   await next();
 },
 playerSportsRouter.routes(),
);

module.exports = router;
