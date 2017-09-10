const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('players', '/', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();
  await ctx.render('players/index', { players });
});

router.get('ongInitiative', '/:id', async (ctx) => {
  const player= await ctx.orm.ong.findById(ctx.params.id);
  await ctx.render('players/show', {player });
});
module.exports = router;
