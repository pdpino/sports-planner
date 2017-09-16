const KoaRouter = require('koa-router');

const router = new KoaRouter();

/**Fix the parameters passed by the sports/_form.html.ejs (used when creating and when editing a sport)*/
function fixUpdateParams(body){
  /* checkbox input passes 'on' when checked and null when not-checked. Parse this to boolean */
  body.isIndividual = Boolean(body.isIndividual);
}

router.get('sports', '/', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();
  await ctx.render('sports/index', {
    sports,
    sportPath: sport => ctx.router.url('sport', { id: sport.id }),
    newSportPath: ctx.router.url('sportNew'),
  });
});

router.get('sportNew', '/new', async (ctx) => {
  const sport = ctx.orm.sport.build();
  await ctx.render('sports/new', {
    sport,
    submitSportPath: ctx.router.url('sportCreate'),
    cancelPath: ctx.router.url('sports'),
  });
});

router.post('sportCreate', '/', async (ctx) => {
  fixUpdateParams(ctx.request.body);
  try {
    const sport = await ctx.orm.sport.create(ctx.request.body);
    ctx.redirect(ctx.router.url('sport', { id: sport.id }));
  } catch (validationError) {
    await ctx.render('sports/new', {
      sport: ctx.orm.sport.build(ctx.request.body),
      errors: validationError.errors,
      submitSportPath: ctx.router.url('sportCreate'),
      cancelPath: ctx.router.url('sports'),
    });
  }
});

router.get('sportEdit', '/:id/edit', async (ctx) => {
  const sport = await ctx.orm.sport.findById(ctx.params.id);
  await ctx.render('sports/edit', {
    sport,
    submitSportPath: ctx.router.url('sportUpdate', sport.id),
    cancelPath: ctx.router.url('sport', { id: ctx.params.id }),
  });
});

router.patch('sportUpdate', '/:id', async (ctx) => {
  fixUpdateParams(ctx.request.body);
  const sport = await ctx.orm.sport.findById(ctx.params.id);
  try {
    await sport.update(ctx.request.body);
    ctx.redirect(ctx.router.url('sport', { id: sport.id }));
  } catch (validationError) {
    await ctx.render('sports/edit', {
      sport,
      errors: validationError.errors,
      submitSportPath: ctx.router.url('sportUpdate', sport.id),
      cancelPath: ctx.router.url('sport', { id: ctx.params.id }),
    });
  }
});

router.get('sport', '/:id', async (ctx) => {
  const sport = await ctx.orm.sport.findById(ctx.params.id);
  await ctx.render('sports/show', {
    sport,
    sportsPath: ctx.router.url('sports'),
    editSportPath: ctx.router.url('sportEdit', sport.id),
    deleteSportPath: ctx.router.url('sportDelete', sport.id),
  });
});

router.delete('sportDelete', '/:id', async (ctx) => {
  const sport = await ctx.orm.sport.findById(ctx.params.id);
  await sport.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('sports'));
});

module.exports = router;
