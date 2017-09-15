const KoaRouter = require('koa-router');

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
    const player = await ctx.orm.player.build(ctx.request.body);
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
  const player= ctx.orm.player.build(ctx.request.body);
  await ctx.render('players/new', {
    player,
    createPlayerPath: ctx.router.url('playerCreate'),
    playersPath : ctx.router.url('players'),
  });
});



router.get('playerShow', '/:id', async (ctx) => {
  const player= await ctx.orm.player.findById(ctx.params.id);
  await ctx.render('players/show', {
    player,
    editPlayerPath: ctx.router.url('playerEdit',player.id),
    cancelPlayerPath: ctx.router.url('players'),
   });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  fixUpdateParams(ctx.request.body);
  const player = await ctx.orm.player.findById(ctx.params.id);
  try {
    await player.update(ctx.request.body);
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player,
      errors: validationError.errors,
      updatePlayerPath: ctx.router.url('playerUpdate', player.id),

    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  await ctx.render('players/edit', {
    player,
    teams: ctx.state.teams,
    updatePlayerPath: ctx.router.url('playerUpdate',player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPlayerPath: ctx.router.url('playerShow',player.id),
    PlayeraddTeamPath: ctx.router.url('PlayeraddTeam',player.id),
  });
});

router.delete('playerDelete', '/:id', async (ctx) => {
   const player = await ctx.orm.player.findById(ctx.params.id);
   await player.destroy();
   ctx.redirect(ctx.router.url('players'));
 });

router.patch('PlayeraddTeam', '/:id', async (ctx) => {
   const player = await ctx.orm.player.findById(ctx.params.id);
   const team = await ctx.orm.team.findById(ctx.request.body);
   player.addteam(team,{through:{isCaptain: true}});
 });


module.exports = router;
