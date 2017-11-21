const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('sports', '/', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();

  ctx.body = ctx.serializeSports(sports);
});

router.get('sport', '/:id', async (ctx) => {
  const sport = await ctx.findById(ctx.orm.sport, ctx.params.id);

  ctx.body = ctx.serializeSport(sport);
});

module.exports = router;
