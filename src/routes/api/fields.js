const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('fields', '/', async (ctx) => {
  const fields = await ctx.orm.field.scope('withCompound').findAll();

  ctx.body = ctx.serializeFields(fields);
});

router.get('field', '/:id', async (ctx) => {
  const field = await ctx.findById(ctx.orm.field.scope('api'), ctx.params.id);

  const includeSports = true;
  const includeCompounds = true;

  ctx.body = ctx.serializeField(field, {
    includeSports,
    includeCompounds,
  });
});

module.exports = router;
