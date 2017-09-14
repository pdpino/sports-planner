const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();
  await ctx.render('players/index', {
    players,
    playerPath: player => ctx.router.url('playerShow', { id: player.id }),
    newPlayerPath: ctx.router.url('playerNew'),
   });
});

router.post('playerCreate', '/new', async (ctx) => {
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
  const player = ctx.orm.player.build(ctx.request.body);
  await ctx.render('players/new', {
    player,
    submitPlayerPath: ctx.router.url('playerCreate'),
    cancelPath : ctx.router.url('players'),
  });
});

router.get('playerShow', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  const playSports = await player.getSports();
  console.log(playSports.length);
  playSports.forEach( (sport) => {console.log(sport)});
  await ctx.render('players/show', {
    player,
    playSports,
    editPlayerPath: ctx.router.url('playerEdit',player.id),
    playersPath: ctx.router.url('players'),
   });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  try {
    await player.update(ctx.request.body);
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player,
      errors: validationError.errors,
      submitPlayerPath: ctx.router.url('playerUpdate', player.id),
    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  await ctx.render('players/edit', {
    player,
    submitPlayerPath: ctx.router.url('playerUpdate',player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPath: ctx.router.url('playerShow', player.id)
  });
});

router.delete('playerDelete', '/:id', async (ctx) => {
   const player = await ctx.orm.player.findById(ctx.params.id);
   await player.destroy();
   ctx.redirect(ctx.router.url('players'));
 });

module.exports = router;
