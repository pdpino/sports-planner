const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('compounds', '/', async (ctx) => {
  const compounds = await ctx.orm.compound.findAll();

  ctx.body = ctx.serializeCompounds(compounds);
});

router.get('compound', '/:id', async (ctx) => {
  const compound = await ctx.findById(ctx.orm.compound.scope('api'), ctx.params.id);

  const includeCompoundOwners = true;
  const includeFields = true;
  const includeReviews = true;

  ctx.body = ctx.serializeCompound(compound, {
    includeCompoundOwners,
    includeFields,
    includeReviews,
  });
});

module.exports = router;
