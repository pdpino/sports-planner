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
  await ctx.render('compounds/index', {
    compounds,
    compoundPath: compound => ctx.router.url('compound', { id: compound.id }),
    newCompoundPath: ctx.router.url('compoundNew'),
  });
});

router.get('compoundNew', '/new', async (ctx) => {
  const compound = ctx.orm.compound.build();
  const compoundOwners = await ctx.orm.compoundOwner.findAll();
  for(let i = 0; i < compoundOwners.length; i++){
    const user = await compoundOwners[i].getUser(); // REVIEW: avoid DB query
    compoundOwners[i] = mergeCompoundOwnerUser(user, compoundOwners[i]);
  }
  await ctx.render('compounds/new', {
    compound,
    compoundOwners,
    submitCompoundPath: ctx.router.url('compoundCreate'),
    cancelPath: ctx.router.url('compounds'),
  });
});

router.post('compoundCreate', '/', async (ctx) => {
  const compoundOwners = await ctx.orm.compoundOwner.findAll();
  for(let i = 0; i < compoundOwners.length; i++){
    const user = await compoundOwners[i].getUser(); // REVIEW: avoid DB query
    compoundOwners[i] = mergeCompoundOwnerUser(user, compoundOwners[i]);
  }
  try {
    const compound = await ctx.orm.compound.create(ctx.request.body);

    ctx.redirect(ctx.router.url('compound', { id: compound.id }));
  } catch (validationError) {
    await ctx.render('compounds/new', {
      compound: ctx.orm.compound.build(ctx.request.body),
      errors: validationError.errors,
      compoundOwners,
      submitCompoundPath: ctx.router.url('compoundCreate'),
      cancelPath: ctx.router.url('compounds'),
    });
  }
});

router.get('compoundEdit', '/:id/edit', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  const compoundOwners = await ctx.orm.compoundOwner.findAll();
  for(let i = 0; i < compoundOwners.length; i++){
    const user = await compoundOwners[i].getUser(); // REVIEW: avoid DB query
    compoundOwners[i] = mergeCompoundOwnerUser(user, compoundOwners[i]);
  }
  await ctx.render('compounds/edit', {
    compound,
    compoundOwners,
    submitCompoundPath: ctx.router.url('compoundUpdate', compound.id),
    deleteCompoundPath: ctx.router.url('compoundDelete', compound.id),
    cancelPath: ctx.router.url('compound', { id: ctx.params.id }),
  });
});

router.patch('compoundUpdate', '/:id', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  const compoundOwners = await ctx.orm.compoundOwner.findAll();
  for(let i = 0; i < compoundOwners.length; i++){
    const user = await compoundOwners[i].getUser(); // REVIEW: avoid DB query
    compoundOwners[i] = mergeCompoundOwnerUser(user, compoundOwners[i]);
  }
  try {
    await compound.update(ctx.request.body);
    ctx.redirect(ctx.router.url('compound', { id: compound.id }));
  } catch (validationError) {
    await ctx.render('compounds/edit', {
      compound,
      errors: validationError.errors,
      compoundOwners,
      submitCompoundPath: ctx.router.url('compoundUpdate', compound.id),
      cancelPath: ctx.router.url('compound', { id: ctx.params.id }),
      deleteCompoundPath: ctx.router.url('compoundDelete', compound.id),
    });
  }
});

router.get('compound', '/:id', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  let compoundOwner = await ctx.orm.compoundOwner.findById(compound.compoundOwnerId);
  const User=await compoundOwner.getUser();
  compoundOwner = mergeCompoundOwnerUser(User, compoundOwner);
  await ctx.render('compounds/show', {
    compound,
    compoundOwner,
    compoundsPath: ctx.router.url('compounds'),
    compoundOwnerPath: compoundOwner => ctx.router.url('compoundOwner', { id: compoundOwner.id }),
    editCompoundPath: ctx.router.url('compoundEdit', compound.id),

  });
});

router.delete('compoundDelete', '/:id', async (ctx) => {
  const compound = await ctx.orm.compound.findById(ctx.params.id);
  await compound.destroy();
  ctx.redirect(ctx.router.url('compounds'));
});


module.exports = router;
