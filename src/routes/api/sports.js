const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('sports', '/', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();

  ctx.body = ctx.jsonSerializer('sports', {
    attributes: ['name', 'logo'],
    topLevelLinks: {
      self: ctx.getFullUrl('sports'),
    },
    dataLinks: {
      self: (dataset, sport) => ctx.getFullUrl('sport', sport.id),
    },
  }).serialize(sports);
});

router.get('sport', '/:id', async (ctx) => {
  const sport = await ctx.orm.sport.findById(ctx.params.id);

  ctx.body = ctx.jsonSerializer('sports', {
    attributes: ['name', 'logo'],
    topLevelLinks: {
      self: ctx.getFullUrl('sport', sport.id),
    },
  }).serialize(sport);
});

module.exports = router;
