const KoaRouter = require('koa-router');

const router = new KoaRouter();



router.get('fields', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  fields= await ctx.state.compound.getFields();
  await ctx.render('fields/index', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    fields,
    fieldPath: field => ctx.router.url('field', {compoundId:ctx.state.compound.id, id: field.id }),
    newFieldPath: ctx.router.url('fieldNew',{compoundId:ctx.state.compound.id}),
  });
});

router.get('fieldNew', '/new', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.state.requireOwnerModifyPermission(ctx, compoundOwner);
  const field = ctx.orm.field.build();
  const sports= await ctx.orm.sport.findAll();
  await ctx.render('fields/new', {
    field,
    compound: ctx.state.compound,
    sports,
    submitFieldPath: ctx.router.url('fieldCreate',{id:field.id,compoundId:ctx.state.compound.id}),
    cancelPath: ctx.router.url('compound',{id:ctx.state.compound.id}),
  });
});

router.post('fieldCreate', '/', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.state.requireOwnerModifyPermission(ctx, compoundOwner);
  const sports= await ctx.orm.sport.findAll();
  try {
    const field = await ctx.orm.field.create(ctx.request.body);

    ctx.redirect(ctx.router.url('field', {compoundId: ctx.state.compound.id, id: field.id }));
  } catch (validationError) {
    await ctx.render('fields/new', {
      compound: ctx.state.compound,
      sports,
      field: ctx.orm.field.build(ctx.request.body),
      errors: ctx.state.parseValidationError(validationError),
      submitFieldPath: ctx.router.url('fieldCreate',{compoundId:ctx.state.compound.id}),
      cancelPath: ctx.router.url('compound',{id:ctx.state.compound.id}),
    });
  }
});

router.get('fieldEdit', '/:id/edit', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.state.requireOwnerModifyPermission(ctx, compoundOwner);
  const sports= await ctx.orm.sport.findAll();
  const field = await ctx.orm.field.findById(ctx.params.id);

  await ctx.render('fields/edit', {
    field,
    compound:  ctx.state.compound,
    sports,
    submitFieldPath: ctx.router.url('fieldUpdate', {id:field.id,compoundId:ctx.state.compound.id}),
    deleteFieldPath: ctx.router.url('fieldDelete', {id:field.id,compoundId:ctx.state.compound.id}),
    cancelPath: ctx.router.url('field', { id: ctx.params.id,compoundId:ctx.state.compound.id }),
  });
});

router.patch('fieldUpdate', '/:id', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.state.requireOwnerModifyPermission(ctx, compoundOwner);
  const sports= await ctx.orm.sport.findAll();
  const field = await ctx.orm.field.findById(ctx.params.id);
  try {
    await field.update(ctx.request.body);
    ctx.redirect(ctx.router.url('field', { id: field.id,compoundId:ctx.state.compound.id }));
  } catch (validationError) {
    await ctx.render('fields/edit', {
      field,
      sports,
      compound: ctx.state.compound,
      errors: ctx.state.parseValidationError(validationError),
      submitFieldPath: ctx.router.url('fieldUpdate', {id:field.id,compoundId:ctx.state.compound.id}),
      cancelPath: ctx.router.url('field', { id: ctx.params.id,compoundId:ctx.state.compound.id }),
      deleteFieldPath: ctx.router.url('fieldDelete', {id:field.id,compoundId:ctx.state.compound.id}),
    });
  }
});

router.get('field', '/:id', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  //const compoundOwner=owner
  const field = await ctx.orm.field.findById(ctx.params.id);
  const compound= await field.getCompound();
  await ctx.render('fields/show', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    field,
    fieldsPath: ctx.router.url('fields', {compoundId: ctx.state.compound.id}),
    compoundPath: compound => ctx.router.url('compound', { id: compound.id }),
    editFieldPath: ctx.router.url('fieldEdit', {compoundId: ctx.state.compound.id, id: field.id}),

  });
});

router.delete('fieldDelete', '/:id', async (ctx) => {
  const compoundOwner= await ctx.state.compound.getCompoundOwner();
  ctx.state.requireOwnerModifyPermission(ctx, compoundOwner);
  const field = await ctx.orm.field.findById(ctx.params.id);
  await field.destroy();
  ctx.redirect(ctx.router.url('compound',{id: ctx.state.compound.id}));
});


module.exports = router;
