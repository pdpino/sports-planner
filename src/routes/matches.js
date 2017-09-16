const KoaRouter = require('koa-router');

const router = new KoaRouter();

/**Fix the parameters passed by the matches/_form.html.ejs (used when creating and when editing a match)*/
function fixSubmitParams(body){
  /* checkbox input passes 'on' when checked and null when not-checked. Parse this to boolean */
  body.isPublic = Boolean(body.isPublic);
}

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.orm.match.findAll();
  await ctx.render('matches/index', {
    matches,
    matchPath: match => ctx.router.url('match', { id: match.id }),
    newMatchPath: ctx.router.url('matchNew'),
  });
});

router.get('matchNew', '/new', async (ctx) => {
  const match = ctx.orm.match.build();
  await ctx.render('matches/new', {
    match,
    submitMatchPath: ctx.router.url('matchCreate'),
    cancelPath: ctx.router.url('matches'),
  });
});

router.post('matchCreate', '/', async (ctx) => {
  fixSubmitParams(ctx.request.body);
  try {
    const match = await ctx.orm.match.create(ctx.request.body);
    ctx.redirect(ctx.router.url('match', match.id ));
  } catch (validationError) {
    await ctx.render('matches/new', {
      match: ctx.orm.match.build(ctx.request.body),
      errors: validationError.errors,
      submitMatchPath: ctx.router.url('matchCreate'),
      cancelPath: ctx.router.url('matches'),
    });
  }
});

router.get('matchEdit', '/:id/edit', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  await ctx.render('matches/edit', {
    match,
    submitMatchPath: ctx.router.url('matchUpdate', match.id),
    cancelPath: ctx.router.url('match', { id: ctx.params.id }),
  });
});

router.patch('matchUpdate', '/:id', async (ctx) => {
  fixSubmitParams(ctx.request.body);
  const match = await ctx.orm.match.findById(ctx.params.id);
  try {
    await match.update(ctx.request.body);
    ctx.redirect(ctx.router.url('match', { id: match.id }));
  } catch (validationError) {
    await ctx.render('matches/edit', {
      match,
      errors: validationError.errors,
      submitMatchPath: ctx.router.url('matchUpdate', match.id),
      cancelPath: ctx.router.url('match', { id: ctx.params.id }),
    });
  }
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  await ctx.render('matches/show', {
    match,
    matchesPath: ctx.router.url('matches'),
    editMatchPath: ctx.router.url('matchEdit', match.id),
    deleteMatchPath: ctx.router.url('matchDelete', match.id),
  });
});

router.delete('matchDelete', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  await match.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('matches'));
});

module.exports = router;
