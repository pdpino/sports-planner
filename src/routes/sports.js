const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('sports', '/', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();
  await ctx.render('sports/index', {
    sports,
    sportPath: sport => ctx.router.url('sport', { id: sport.id }),
  });
});

router.get('sport', '/:id', async (ctx) => {
  const sport = await ctx.orm.sport.findById(ctx.params.id);
  await ctx.render('sports/show', {
    sport,
    // initiatives,
    // ongInitiativesPath: ctx.router.url('ongInitiatives', ong.id),
  });
});

module.exports = router;
