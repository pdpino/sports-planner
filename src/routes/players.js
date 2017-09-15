const KoaRouter = require('koa-router');
const playerTeamsRouter = require('./playerTeams');
const router = new KoaRouter();

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();
  await ctx.render('players/index', {
    players,
    createPlayerPath: ctx.router.url('playerNew'),
   });
});


router.post('playerCreate', '/new', async (ctx) => {
  try {
    const player = await ctx.orm.player.build(ctx.request.bod);
    player.save().then(() => {});
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    await ctx.render('players/new', {
      player:ctx.orm.player.build(ctx.request.body),
      errors: validationError.errors,
      createPlayerPath: ctx.router.url('playerCreate'),
    });
  }
});

router.get('playerNew', '/new', async (ctx) => {
  const player= ctx.orm.player.build();
  await ctx.render('players/new', {
    player,
    createPlayerPath: ctx.router.url('playerCreate'),
    playersPath : ctx.router.url('players'),
    submitPlayerPath: ctx.router.url('playerCreate'),
  });
});



router.get('playerShow', '/:id', async (ctx) => {
  const player= await ctx.orm.player.findById(ctx.params.id);
  const memberofTeams = await player.getTeams();
  await ctx.render('players/show', {
    player,
    memberofTeams,
    editPlayerPath: ctx.router.url('playerEdit',player.id),
    cancelPlayerPath: ctx.router.url('players'),
    editPlayerTeamPath: (team) => ctx.router.url('playerTeamEdit', { playerId: player.id, id: team.id } ),
createPlayerTeamsPath: ctx.router.url('playerTeamNew', { playerId: player.id } ),
playersPath: ctx.router.url('players'),
   });
});

router.patch('playerUpdate', '/:id', async (ctx) => {

  const player = await ctx.orm.player.findById(ctx.params.id);
  try {
    await player.update(ctx.request.body);
    player.save().then(() => {});
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player,
      teams: await ctx.orm.team.findAll(),
      errors: validationError.errors,
      updatePlayerPath: ctx.router.url('playerUpdate',player.id),
      deletePlayerPath: ctx.router.url('playerDelete', player.id),
      cancelPlayerPath: ctx.router.url('playerShow',player.id),
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
    updatePlayerPath: ctx.router.url('playerUpdate',player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPlayerPath: ctx.router.url('playerShow',player.id),
    editPlayerTeamsPath: ctx.router.url('playerTeams',player.id),
    submitPlayerPath: ctx.router.url('playerUpdate',player.id),
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

module.exports = router;
