const KoaRouter = require('koa-router');
const fieldsRouter = require('./fields');
const router = new KoaRouter();

router.get('compounds', '/', async (ctx) => {
  const compounds = await ctx.orm.compound.findAll();

  await ctx.render('compounds/index', {
    compounds,
    hasCreatePermission: ctx.state.isOwnerLoggedIn,
    newCompoundPath: ctx.router.url('compoundNew'),
  });
});

router.get('compoundNew', '/new', async (ctx) => {
  ctx.requireOwnerLoggedIn();

  const compound = ctx.orm.compound.build();

  await ctx.render('compounds/new', {
    compound,
    submitCompoundPath: ctx.router.url('compoundCreate'),
    cancelPath: ctx.router.url('compounds'),
  });
});

router.post('compoundCreate', '/', async (ctx) => {
  ctx.requireOwnerLoggedIn();

  const params = ctx.request.body; // TODO: parse, permit and require
  // ctx.state.currentOwner.addCompound(compound);
  params.compoundOwnerId = ctx.state.currentOwner.id;

  try {
    const compound = await ctx.orm.compound.create(params);

    ctx.redirect(ctx.router.url('compound', { id: compound.id }));
  } catch (validationError) {
    await ctx.render('compounds/new', {
      compound: ctx.orm.compound.build(ctx.request.body),
      errors: ctx.parseValidationError(validationError),
      submitCompoundPath: ctx.router.url('compoundCreate'),
      cancelPath: ctx.router.url('compounds'),
    });
  }
});

router.get('compoundEdit', '/:id/edit', async (ctx) => {
  const compound = await ctx.findById(ctx.orm.compound, ctx.params.id);
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, compound.compoundOwnerId);

  ctx.requireOwnerModifyPermission(compoundOwner);

  await ctx.render('compounds/edit', {
    compound,
    submitCompoundPath: ctx.router.url('compoundUpdate', compound.id),
    deleteCompoundPath: ctx.router.url('compoundDelete', compound.id),
    cancelPath: ctx.router.url('compound', { id: ctx.params.id }),
  });
});

router.patch('compoundUpdate', '/:id', async (ctx) => {
  const compound = await ctx.findById(ctx.orm.compound, ctx.params.id);
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, compound.compoundOwnerId);

  ctx.requireOwnerModifyPermission(compoundOwner);

  try {
    await compound.update(ctx.request.body);
    ctx.redirect(ctx.router.url('compound', { id: compound.id }));
  } catch (validationError) {
    await ctx.render('compounds/edit', {
      compound,
      errors: ctx.parseValidationError(validationError),
      submitCompoundPath: ctx.router.url('compoundUpdate', compound.id),
      cancelPath: ctx.router.url('compound', { id: ctx.params.id }),
      deleteCompoundPath: ctx.router.url('compoundDelete', compound.id),
    });
  }
});

router.get('compound', '/:id', async (ctx) => {
  const compound = await ctx.findById(ctx.orm.compound, ctx.params.id);
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, compound.compoundOwnerId);
  const fields = await compound.getFields();
  const compoundId = compound.id;

  await ctx.render('compounds/show', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    compound,
    compoundId,
    fields,
    compoundOwner,
    getFieldPath: (field) => ctx.router.url('field', {id:field.id,compoundId: compoundId  }),
    compoundsPath: ctx.router.url('compounds'),
    editCompoundPath: ctx.router.url('compoundEdit', compound.id),
    newFieldPath: ctx.router.url('fieldNew',compound.id),
  });
});

router.delete('compoundDelete', '/:id', async (ctx) => {
  const compound = await ctx.findById(ctx.orm.compound, ctx.params.id);
  await compound.destroy();
  ctx.redirect(ctx.router.url('compounds'));
});

router.use(
  '/:compoundId/fields',
  async (ctx, next) => {
    ctx.state.sports = await ctx.orm.sport.findAll();
    ctx.state.compound = await ctx.findById(ctx.orm.compound, ctx.params.compoundId);
    ctx.state.compoundOwner = await ctx.state.compound.getCompoundOwner();
    return next();
  },
  fieldsRouter.routes(),
);

module.exports = router;
