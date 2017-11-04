const KoaRouter = require('koa-router');
const FileStorage= require('../services/file-storage');

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

router.get('compoundOwners', '/', async (ctx) => {
  const compoundOwners = await ctx.orm.compoundOwner.findAll();

  await ctx.render('compoundOwners/index', {
    compoundOwners,
    newcompoundOwnerPath: ctx.router.url('compoundOwnerNew'),
  });
});

router.get('compoundOwnerNew', '/new', async (ctx) => {
  ctx.requireNoLogin();

  const compoundOwner = ctx.orm.compoundOwner.build(ctx.request.body);

  await ctx.render('compoundOwners/new', {
    compoundOwner,
    submitCompoundOwnerPath: ctx.router.url('compoundOwnerCreate'),
    cancelPath : ctx.router.url('compoundOwners'),
  });
});

router.post('compoundOwnerCreate', '/', async (ctx) => {
  ctx.requireNoLogin();

  const userParams = getUserParams(ctx.request.body.fields);
  const compoundOwnerParams = getCompoundOwnerParams(ctx.request.body.fields);

  try {
    const user = await ctx.orm.user.create(userParams);
    userParams.photo=FileStorage.url("user" + user.id,{});
    await user.update(userParams);
    compoundOwnerParams.userId = user.id;
    // REVIEW: create compoundOwner first to validate params ?
    FileStorage.upload(ctx.request.body.files.photo, "user" + user.id);
    const compoundOwner = await ctx.orm.compoundOwner.create(playerParams);

    ctx.redirect(ctx.router.url('compoundOwners'));
  } catch (validationError) {
    await ctx.render('compoundOwners/new', {
      compoundOwner: ctx.orm.compoundOwner.build(ctx.request.body),
      errors: ctx.parseValidationError(validationError),
      submitCompoundOwnerPath: ctx.router.url('compoundOwnerCreate'),
      cancelPath: ctx.router.url('compoundOwners'),
    });
  }
});

router.get('compoundOwnerEdit', '/:id/edit', async (ctx) => {
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, ctx.params.id);

  ctx.requireModifyPermission(compoundOwner);

  await ctx.render('compoundOwners/edit', {
    compoundOwner,
    submitCompoundOwnerPath: ctx.router.url('compoundOwnerUpdate', compoundOwner.id),
    deleteCompoundOwnerPath: ctx.router.url('compoundOwnerDelete', compoundOwner.id),
    cancelPath: ctx.router.url('compoundOwner', { id: compoundOwner.id }),
  });
});

router.patch('compoundOwnerUpdate', '/:id', async (ctx) => {
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, ctx.params.id);

  ctx.requireModifyPermission(compoundOwner);

  const userParams = getUserParams(ctx.request.body.fields);
  const compoundOwnerParams = getCompoundOwnerParams(ctx.request.body.fields);

  try {
    userParams.photo = FileStorage.url("user" + compoundOwner.user.id,{});
    await compoundOwner.user.update(userParams);
    FileStorage.upload(ctx.request.body.files.photo, "user" + compoundOwner.user.id);
    await compoundOwner.update(compoundOwnerParams);
    ctx.redirect(ctx.router.url('compoundOwner', { id: compoundOwner.id }));
  } catch (validationError) {
    await ctx.render('compoundOwners/edit', {
      compoundOwner,
      errors: ctx.parseValidationError(validationError),
      submitCompoundOwnerPath: ctx.router.url('compoundOwnerUpdate', compoundOwner.id),
      deleteCompoundOwnerPath: ctx.router.url('compoundOwnerDelete', compoundOwner.id),
      cancelPath: ctx.router.url('compoundOwner', { id: compoundOwner.id }),
    });
  }
});

router.get('compoundOwner', '/:id', async (ctx) => {
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, ctx.params.id);
  const compounds = await compoundOwner.getCompounds();

  await ctx.render('compoundOwners/show', {
    compoundOwner,
    compounds,
    hasModifyPermission: ctx.hasModifyPermission(compoundOwner),
    editCompoundOwnerPath: ctx.router.url('compoundOwnerEdit', compoundOwner.id),
  });
});

router.delete('compoundOwnerDelete', '/:id', async (ctx) => {
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, ctx.params.id);

  ctx.requireModifyPermission(compoundOwner);
  FileStorage.destrory("user" + compoundOwner.user.id);
  await compoundOwner.user.destroy(); // NOTE: compoundOwner.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('compoundOwners'));
});


module.exports = router;
