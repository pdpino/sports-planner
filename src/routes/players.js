const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('players', '/', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();
  await ctx.render('players/index', { players });
});

router.get('player', '/:id', async (ctx) => {
  const player= await ctx.orm.player.findById(ctx.params.id);
  await ctx.render('players/show', { player });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const player = await ctx.orm.initiative.findById(ctx.params.id);
  try {
    await initiative.update(ctx.request.body);
  } catch (validationError) {
    await ctx.render('player/edit', {
      player,
      errors: validationError.errors
    });
  }
});

router.get('playerNew', '/new', async (ctx) => {
  const player = ctx.orm.player.build();
  await ctx.render('initiatives/new', {
    player
  });
});

module.exports = router;
