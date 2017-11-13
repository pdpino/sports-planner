const KoaRouter = require('koa-router');
const _ = require('lodash');
const FileStorage= require('../services/file-storage');

const router = new KoaRouter();

function getParams(params){
  const filteredParams = _.pick(params, 'name', 'logo', 'isIndividual');
  /* checkbox input passes 'on' when checked and null when not-checked. Parse this to boolean */
  filteredParams.isIndividual = Boolean(filteredParams.isIndividual);
  return filteredParams;
}

router.get('sports', '/', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();
  await ctx.render('sports/index', {
    sports,
    hasModifyPermission: ctx.hasAdminPermission(),
    newSportPath: ctx.router.url('sportNew'),
  });
});

router.get('sportNew', '/new', async (ctx) => {
  ctx.requireAdmin();

  const sport = ctx.orm.sport.build();
  await ctx.render('sports/new', {
    sport,
    submitSportPath: ctx.router.url('sportCreate'),
    cancelPath: ctx.router.url('sports'),
  });
});

router.post('sportCreate', '/', async (ctx) => {
  ctx.requireAdmin();

  const params = getParams(ctx.request.body.fields);
  try {
    params.logo=FileStorage.url(params.name,{})
    const sport = await ctx.orm.sport.create(params);
    FileStorage.upload(ctx.request.body.files.logo, params.name);
    ctx.redirect(ctx.router.url('sport', { id: sport.id }));
  } catch (validationError) {
    await ctx.render('sports/new', {
      sport: ctx.orm.sport.build(params),
      errors: ctx.parseValidationError(validationError),
      submitSportPath: ctx.router.url('sportCreate'),
      cancelPath: ctx.router.url('sports'),
    });
  }
});

router.get('sportEdit', '/:id/edit', async (ctx) => {
  ctx.requireAdmin();

  const sport = await ctx.findById(ctx.orm.sport, ctx.params.id);
  await ctx.render('sports/edit', {
    sport,
    submitSportPath: ctx.router.url('sportUpdate', sport.id),
    cancelPath: ctx.router.url('sport', { id: ctx.params.id }),
  });
});

router.patch('sportUpdate', '/:id', async (ctx) => {
  ctx.requireAdmin();

  const sport = await ctx.findById(ctx.orm.sport, ctx.params.id);
  const params = getParams(ctx.request.body.fields);
  try {
    params.logo=FileStorage.url(params.name,{})
    FileStorage.upload(ctx.request.body.files.logo, params.name);
    await sport.update(params);
    ctx.redirect(ctx.router.url('sport', { id: sport.id }));
  } catch (validationError) {
    await ctx.render('sports/edit', {
      sport,
      errors: ctx.parseValidationError(validationError),
      submitSportPath: ctx.router.url('sportUpdate', sport.id),
      cancelPath: ctx.router.url('sport', { id: ctx.params.id }),
    });
  }
});

router.get('sport', '/:id', async (ctx) => {
  const sport = await ctx.findById(ctx.orm.sport, ctx.params.id);
  await ctx.render('sports/show', {
    sport,
    hasModifyPermission: ctx.hasAdminPermission(),
    editSportPath: ctx.router.url('sportEdit', sport.id),
    deleteSportPath: ctx.router.url('sportDelete', sport.id),
  });
});

router.delete('sportDelete', '/:id', async (ctx) => {
  ctx.requireAdmin();

  const sport = await ctx.findById(ctx.orm.sport, ctx.params.id);
  FileStorage.destroy(sport.name);
  await sport.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('sports'));
});

module.exports = router;
