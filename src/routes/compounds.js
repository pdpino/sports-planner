const KoaRouter = require('koa-router');

const router = new KoaRouter();

function mergeCompoundOwnerUser(user, compoundOwner){
  const compoundOwnerFull = { //HACK: can't use assign because dataValues property.
    id: compoundOwner.id,
    email: user.email,
    phone: compoundOwner.phone,
    photo: user.photo,
    firstName: user.firstName,
    lastName: user.lastName,
    password: user.password,
    isNewRecord: compoundOwner.isNewRecord,
  };
  return compoundOwnerFull;
}

router.get('compounds', '/', async (ctx) => {
  const compounds = await ctx.orm.compound.findAll();

  console.log("IS OWNER LOGGED IN:", ctx.state.isOwnerLoggedIn);

  await ctx.render('compounds/index', {
    compounds,
    hasCreatePermission: ctx.state.isOwnerLoggedIn,
    newCompoundPath: ctx.router.url('compoundNew'),
  });
});

router.get('compoundNew', '/new', async (ctx) => {
  if (!ctx.state.requireOwnerLogin(ctx)) return;

  const compound = ctx.orm.compound.build();

  await ctx.render('compounds/new', {
    compound,
    submitCompoundPath: ctx.router.url('compoundCreate'),
    cancelPath: ctx.router.url('compounds'),
  });
});

router.post('compoundCreate', '/', async (ctx) => {
  if (!ctx.state.requireOwnerLogin(ctx)) return;

  const params = ctx.request.body; // TODO: parse, permit and require
  // ctx.state.currentOwner.addCompound(compound);
  params.compoundOwnerId = ctx.state.currentOwner.id;

  try {
    const compound = await ctx.orm.compound.create(params);

    ctx.redirect(ctx.router.url('compound', { id: compound.id }));
  } catch (validationError) {
    console.log("ERROR EN VALIDACION COMPOUND: ", validationError);
    await ctx.render('compounds/new', {
      compound: ctx.orm.compound.build(ctx.request.body),
      errors: validationError.errors,
      submitCompoundPath: ctx.router.url('compoundCreate'),
      cancelPath: ctx.router.url('compounds'),
    });
  }
});

router.get('compoundEdit', '/:id/edit', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  const compoundOwner = await ctx.orm.compoundOwner.findById(compound.compoundOwnerId);

  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;

  await ctx.render('compounds/edit', {
    compound,
    submitCompoundPath: ctx.router.url('compoundUpdate', compound.id),
    deleteCompoundPath: ctx.router.url('compoundDelete', compound.id),
    cancelPath: ctx.router.url('compound', { id: ctx.params.id }),
  });
});

router.patch('compoundUpdate', '/:id', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  const compoundOwner = await ctx.orm.compoundOwner.findById(compound.compoundOwnerId);

  if (!ctx.state.requireOwnerModifyPermission(ctx, compoundOwner)) return;

  try {
    await compound.update(ctx.request.body);
    ctx.redirect(ctx.router.url('compound', { id: compound.id }));
  } catch (validationError) {
    await ctx.render('compounds/edit', {
      compound,
      errors: validationError.errors,
      submitCompoundPath: ctx.router.url('compoundUpdate', compound.id),
      cancelPath: ctx.router.url('compound', { id: ctx.params.id }),
      deleteCompoundPath: ctx.router.url('compoundDelete', compound.id),
    });
  }
});

router.get('compound', '/:id', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  const compoundOwner = await ctx.orm.compoundOwner.findById(compound.compoundOwnerId);

  await ctx.render('compounds/show', {
    hasModifyPermission: ctx.state.hasOwnerModifyPermission(ctx, compoundOwner),
    compound,
    compoundOwner,
    compoundsPath: ctx.router.url('compounds'),
    editCompoundPath: ctx.router.url('compoundEdit', compound.id),
  });
});

router.delete('compoundDelete', '/:id', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  await compound.destroy();
  ctx.redirect(ctx.router.url('compounds'));
});


module.exports = router;
