const KoaRouter = require('koa-router');

const router = new KoaRouter();



router.get('fields', '/', async (ctx) => {
  const fields = await ctx.orm.field.findAll();
  await ctx.render('fields/index', {
    fields,
    fieldPath: field => ctx.router.url('field', { id: field.id }),
    newFieldPath: ctx.router.url('fieldNew'),
  });
});

router.get('fieldNew', '/new', async (ctx) => {
  const field = ctx.orm.field.build();
  const compounds= await ctx.orm.compound.findAll();
  const sports= await ctx.orm.sport.findAll();
  await ctx.render('fields/new', {
    field,
    compounds,
    sports,
    submitFieldPath: ctx.router.url('fieldCreate'),
    cancelPath: ctx.router.url('fields'),
  });
});

router.post('fieldCreate', '/', async (ctx) => {
  const compounds= await ctx.orm.compound.findAll();
  const sports= await ctx.orm.sport.findAll();
  try {
    const field = await ctx.orm.field.create(ctx.request.body);

    ctx.redirect(ctx.router.url('field', { id: field.id }));
  } catch (validationError) {
    await ctx.render('fields/new', {
      compounds,
      sports,
      field: ctx.orm.field.build(ctx.request.body),
      errors: validationError.errors,
      submitFieldPath: ctx.router.url('fieldCreate'),
      cancelPath: ctx.router.url('fields'),
    });
  }
});

router.get('fieldEdit', '/:id/edit', async (ctx) => {
  const compounds= await ctx.orm.compound.findAll();
  const sports= await ctx.orm.sport.findAll();
  const field = await ctx.orm.field.findById(ctx.params.id);

  await ctx.render('fields/edit', {
    field,
    compounds,
    sports,
    submitFieldPath: ctx.router.url('fieldUpdate', field.id),
    deleteFieldPath: ctx.router.url('fieldDelete', field.id),
    cancelPath: ctx.router.url('field', { id: ctx.params.id }),
  });
});

router.patch('fieldUpdate', '/:id', async (ctx) => {
  const sports= await ctx.orm.sport.findAll();
  const compounds= await ctx.orm.compound.findAll();
  const field = await ctx.orm.field.findById(ctx.params.id);
  try {
    await field.update(ctx.request.body);
    ctx.redirect(ctx.router.url('field', { id: field.id }));
  } catch (validationError) {
    await ctx.render('fields/edit', {
      field,
      sports,
      compounds,
      errors: validationError.errors,
      submitFieldPath: ctx.router.url('fieldUpdate', field.id),
      cancelPath: ctx.router.url('field', { id: ctx.params.id }),
      deleteFieldPath: ctx.router.url('fieldDelete', field.id),
    });
  }
});

router.get('field', '/:id', async (ctx) => {
  const field = await ctx.orm.field.findById(ctx.params.id);
  await ctx.render('fields/show', {
    field,
    fieldOwner,
    fieldsPath: ctx.router.url('fields'),
    compoundPath: compound => ctx.router.url('compound', { id: compound.id }),
    editFieldPath: ctx.router.url('fieldEdit', field.id),

  });
});

router.delete('fieldDelete', '/:id', async (ctx) => {
  const field = await ctx.orm.field.findById(ctx.params.id);
  await field.destroy();
  ctx.redirect(ctx.router.url('fields'));
});


module.exports = router;
