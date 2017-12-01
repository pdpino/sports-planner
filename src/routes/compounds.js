const KoaRouter = require('koa-router');
const fieldsRouter = require('./fields');
const compoundReviewsRouter = require('./compoundReviews');
const FileStorage = require('../services/file-storage');

const router = new KoaRouter();

router.get('compounds', '/', async (ctx) => {
  const compounds = await ctx.orm.compound.findAll();

  await ctx.render('compounds/index', {
    compounds,
    hasCreatePermission: ctx.state.isOwnerLoggedIn,
    newCompoundPath: ctx.router.url('compoundNew'),
    newCompoundFoursquarePath: ctx.router.url('compoundNewFoursquare'),
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

router.get('compoundNewFoursquare', '/new_foursquare', async (ctx) => {
  ctx.requireOwnerLoggedIn();
  await ctx.render('compounds/new_foursquare', { });
});

router.post('compoundCreateFoursquare', '/foursquare', async (ctx) => {
  ctx.requireOwnerLoggedIn();

  const params = ctx.request.body;
  params.compoundOwnerId = ctx.state.currentOwner.id;

  try {
    const compound = await ctx.orm.compound.create(params);
    if (anyPhoto) {
      FileStorage.upload(photoFile, "compound" + compound.id);
      params.photo = FileStorage.url("compound" + compound.id,{});
      await compound.update(params);
    }
    ctx.body = { };
  } catch (validationError) {
    ctx.body = { errors: ctx.parseValidationError(validationError) };
  }

});

router.post('compoundCreate', '/', async (ctx) => {
  ctx.requireOwnerLoggedIn();
  const params = ctx.getParams();
  params.compoundOwnerId = ctx.state.currentOwner.id;
  console.log("PARAMS: ", params);
  const photoFile = params.photo;
  const anyPhoto = photoFile.name;
  params.photo = '';

  try {
    const compound = await ctx.orm.compound.create(params);
    if (anyPhoto) {
      FileStorage.upload(photoFile, "compound" + compound.id);
      params.photo = FileStorage.url("compound" + compound.id,{});
      console.log("PARAMS 222: ", params);
      await compound.update(params);
    }
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

  const params = ctx.getParams();
  const photoFile = params.photo;
  const anyPhoto = photoFile.name;

  try {
    if (anyPhoto) {
      params.photo = FileStorage.url("compound" + compound.id,{});
    } else {
      params.photo = '';
    }
    await compound.update(params);
    FileStorage.upload(photoFile, "compound" + compound.id);
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
  const compoundOwner = await compound.getCompoundOwner();
  const fields = await compound.getFields();

  const reviews = await compound.getDoneReviews();

  await ctx.render('compounds/show', {
    compound,
    compoundOwner,
    fields,
    reviews,
    hasModifyPermission: ctx.hasModifyPermission(compoundOwner),
    editCompoundPath: ctx.router.url('compoundEdit', compound.id),
    newFieldPath: ctx.router.url('fieldNew', compound.id),
  });
});

router.delete('compoundDelete', '/:id', async (ctx) => {
  const compound = await ctx.findById(ctx.orm.compound, ctx.params.id);
  FileStorage.destroy("compound"+compound.id)
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

router.use(
  '/:compoundId/reviews',
  async (ctx, next) => {
    ctx.state.compound = await ctx.findById(ctx.orm.compound, ctx.params.compoundId);
    return next();
  },
  compoundReviewsRouter.routes(),
);

module.exports = router;
