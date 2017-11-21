const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('compoundOwners', '/', async (ctx) => {
  const compoundOwners = await ctx.orm.compoundOwner.findAll();

  ctx.body = ctx.serializeCompoundOwners(compoundOwners);
});

router.get('compoundOwner', '/:id', async (ctx) => {
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner.scope('api'), ctx.params.id);

  const includeCompounds = true;

  ctx.body = ctx.serializeCompoundOwner(compoundOwner, {
    includeCompounds,
  });
});

module.exports = router;
