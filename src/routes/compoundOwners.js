const KoaRouter = require('koa-router');
const router = new KoaRouter();

/** Extract the User parameters from a params object (such as request.body) **/
function getUserParams(params){
  return {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    role: 'owner',
  };
}

/** Extract the compoundOwner parameters from a params object (such as request.body) **/
function getCompoundOwnerParams(params){
  return {
    phone: params.phone
  };
}

/** Load the owner and his user from the database **/
async function getOwnerAndUser(ctx, compoundOwnerId){
  // REVIEW: apparently not all calls of this need both user and compoundOwner
  const compoundOwner = await ctx.orm.compoundOwner.findById(compoundOwnerId);
  const user = compoundOwner && await compoundOwner.getUser();
  return { compoundOwner, user };
}


router.get('compoundOwners', '/', async (ctx) => {
  const compoundOwners = await ctx.orm.compoundOwner.findAll();

  await ctx.render('compoundOwners/index', {
    compoundOwners,
    newcompoundOwnerPath: ctx.router.url('compoundOwnerNew'),
  });
});

router.get('compoundOwnerNew', '/new', async (ctx) => {
  ctx.state.requireNoLogin(ctx);

  const compoundOwner = ctx.orm.compoundOwner.build(ctx.request.body);

  await ctx.render('compoundOwners/new', {
    compoundOwner,
    submitcompoundOwnerPath: ctx.router.url('compoundOwnerCreate'),
    cancelPath : ctx.router.url('compoundOwners'),
  });
});

router.post('compoundOwnerCreate', '/', async (ctx) => {
  ctx.state.requireNoLogin(ctx);

  const userParams = getUserParams(ctx.request.body);
  const compoundOwnerParams = getCompoundOwnerParams(ctx.request.body);

  try {
    const user = await ctx.orm.user.create(userParams);
    compoundOwnerParams.userId = user.id;
    const compoundOwner = await ctx.orm.compoundOwner.create(compoundOwnerParams);
    ctx.redirect(ctx.router.url('compoundOwners'));
  } catch (validationError) {
    await ctx.render('compoundOwners/new', {
      compoundOwner: ctx.orm.compoundOwner.build(ctx.request.body),
      errors: validationError.errors,
      submitcompoundOwnerPath: ctx.router.url('compoundOwnerCreate'),
      cancelPath: ctx.router.url('compoundOwners'),
    });
  }
});

router.get('compoundOwnerEdit', '/:id/edit', async (ctx) => {
  const compoundOwner = await ctx.orm.compoundOwner.findById(ctx.params.id);

  if (!ctx.state.requireModifyPermission(ctx, compoundOwner.userId)) return;

  await ctx.render('compoundOwners/edit', {
    compoundOwner,
    submitcompoundOwnerPath: ctx.router.url('compoundOwnerUpdate', compoundOwner.id),
    deletecompoundOwnerPath: ctx.router.url('compoundOwnerDelete', compoundOwner.id),
    cancelPath: ctx.router.url('compoundOwner', { id: compoundOwner.id }),
  });
});

router.patch('compoundOwnerUpdate', '/:id', async (ctx) => {
  const { compoundOwner, user } = await getOwnerAndUser(ctx, ctx.params.id);

  if (!ctx.state.requireModifyPermission(ctx, user.id)) return;

  const userParams = getUserParams(ctx.request.body);
  const compoundOwnerParams = getCompoundOwnerParams(ctx.request.body);

  try {
    await user.update(userParams);
    await compoundOwner.update(compoundOwnerParams);
    ctx.redirect(ctx.router.url('compoundOwner', { id: compoundOwner.id }));
  } catch (validationError) {
    await ctx.render('compoundOwners/edit', {
      compoundOwner,
      errors: validationError.errors,
      submitcompoundOwnerPath: ctx.router.url('compoundOwnerUpdate', compoundOwner.id),
      deletecompoundOwnerPath: ctx.router.url('compoundOwnerDelete', compoundOwner.id),
      cancelPath: ctx.router.url('compoundOwner', { id: compoundOwner.id }),
    });
  }
});

router.get('compoundOwner', '/:id', async (ctx) => {
  const compoundOwner = await ctx.orm.compoundOwner.findById(ctx.params.id);
  const compounds = await compoundOwner.getCompounds();

  await ctx.render('compoundOwners/show', {
    compoundOwner,
    compounds,
    hasModifyPermission: ctx.state.hasModifyPermission(ctx, compoundOwner.userId),
    editCompoundOwnerPath: ctx.router.url('compoundOwnerEdit', compoundOwner.id),
  });
});

router.delete('compoundOwnerDelete', '/:id', async (ctx) => {
  const { compoundOwner, user } = await getOwnerAndUser(ctx, ctx.params.id);

  if (!ctx.state.requireModifyPermission(ctx, user.id)) return;

  await user.destroy(); // NOTE: compoundOwner.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('compoundOwners'));
});


module.exports = router;
