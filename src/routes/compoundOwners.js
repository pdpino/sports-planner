const KoaRouter = require('koa-router');
const router = new KoaRouter();


function getUserParams(params){
  return {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    role: 'owner',
  };
}

function getCompoundOwnerParams(params){
  return {
    phone: params.phone
  };
}



/** TODO (se usa solo en vistas0) **/
function mergeCompoundOwnerUser(user, compoundOwner){
  return { //HACK: can't use assign because dataValues property.
    id: compoundOwner.id,
    email: user.email,
    phone: compoundOwner.phone,
    photo: user.photo,
    firstName: user.firstName,
    lastName: user.lastName,
    password: user.password,
    isNewRecord: compoundOwner.isNewRecord,
  };
}


router.get('compoundOwners', '/', async (ctx) => {
  const compoundOwners = await ctx.orm.compoundOwner.findAll();
  for(let i = 0; i < compoundOwners.length; i++){
    const user = await compoundOwners[i].getUser(); // REVIEW: avoid DB query
    compoundOwners[i]=mergeCompoundOwnerUser(user,compoundOwners[i]);
  }
  await ctx.render('compoundOwners/index', {
    compoundOwners,
    compoundOwnerPath: compoundOwner => ctx.router.url('compoundOwner', { id: compoundOwner.id }),
    newcompoundOwnerPath: ctx.router.url('compoundOwnerNew'),
  });
});

router.get('compoundOwnerNew', '/new', async (ctx) => {
  const user = ctx.orm.user.build(ctx.request.body);
  const compoundOwner = ctx.orm.compoundOwner.build(ctx.request.body);
  await ctx.render('compoundOwners/new', {
    compoundOwner: mergeCompoundOwnerUser(user, compoundOwner),
    submitcompoundOwnerPath: ctx.router.url('compoundOwnerCreate'),
    cancelPath : ctx.router.url('compoundOwners'),
  });
});

router.post('compoundOwnerCreate', '/', async (ctx) => {
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
      genders,
      errors: validationError.errors,
      submitcompoundOwnerPath: ctx.router.url('compoundOwnerCreate'),
      cancelPath: ctx.router.url('compoundOwners'),
    });
  }
});

router.get('compoundOwnerEdit', '/:id/edit', async (ctx) => {
  const compoundOwner = await ctx.orm.compoundOwner.findById(ctx.params.id);
  const user = await ctx.orm.user.findById(compoundOwner.userId);
  await ctx.render('compoundOwners/edit', {
    compoundOwner: mergeCompoundOwnerUser(user, compoundOwner),
    submitcompoundOwnerPath: ctx.router.url('compoundOwnerUpdate', compoundOwner.id),
    deletecompoundOwnerPath: ctx.router.url('compoundOwnerDelete', compoundOwner.id),
    cancelPath: ctx.router.url('compoundOwner', { id: compoundOwner.id }),
  });
});

router.patch('compoundOwnerUpdate', '/:id', async (ctx) => {
  const compoundOwner = await ctx.orm.compoundOwner.findById(ctx.params.id);
  const user = await ctx.orm.user.findById(compoundOwner.userId);
  const userParams = getUserParams(ctx.request.body);
  const compoundOwnerParams = getCompoundOwnerParams(ctx.request.body);
  try {
    await user.update(userParams);
    await compoundOwner.update(compoundOwnerParams);
    ctx.redirect(ctx.router.url('compoundOwner', { id: compoundOwner.id }));
  } catch (validationError) {
    await ctx.render('compoundOwners/edit', {
      compoundOwner: mergeCompoundOwnerUser(user, compoundOwner),
      errors: validationError.errors,
      submitcompoundOwnerPath: ctx.router.url('compoundOwnerUpdate', compoundOwner.id),
      deletecompoundOwnerPath: ctx.router.url('compoundOwnerDelete', compoundOwner.id),
      cancelPath: ctx.router.url('compoundOwner', { id: compoundOwner.id }),
    });
  }
});

router.get('compoundOwner', '/:id', async (ctx) => {
  const compoundOwner = await ctx.orm.compoundOwner.findById(ctx.params.id);
  const user = await compoundOwner.getUser();
  await ctx.render('compoundOwners/show', {
    compoundOwner: mergeCompoundOwnerUser(user, compoundOwner),
    editcompoundOwnerPath: ctx.router.url('compoundOwnerEdit', compoundOwner.id),
    compoundOwnersPath: ctx.router.url('compoundOwners'),
  });
});

router.delete('compoundOwnerDelete', '/:id', async (ctx) => {
  const compoundOwner = await ctx.orm.compoundOwner.findById(ctx.params.id);
  const user = await ctx.orm.user.findById(compoundOwner.userId);
  await user.destroy(); // NOTE: compoundOwner.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('compoundOwners'));
});


module.exports = router;
