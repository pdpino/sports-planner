const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('teams', '/', async (ctx) => {
  const teams = await ctx.orm.team.findAll();
  await ctx.render('teams/index', {
    teams,
    teamPath: team => ctx.router.url('team', { id: team.id }),
    newTeamPath: ctx.router.url('teamNew'),
  });
});

router.get('teamNew', '/new', async (ctx) => {
  const team = ctx.orm.team.build();
  await ctx.render('teams/new', {
    team,
    submitTeamPath: ctx.router.url('teamCreate'),
  });
});

router.get('teamEdit', '/:id/edit', async (ctx) => {
  const team = await ctx.orm.team.findById(ctx.params.id);
  await ctx.render('teams/edit', {
    team,
    submitTeamPath: ctx.router.url('teamUpdate', team.id),
  });
});

router.post('teamCreate', '/', async (ctx) => {
  try {
    const team = await ctx.orm.team.create(ctx.request.body);
    ctx.redirect(ctx.router.url('team', { id: team.id }));
  } catch (validationError) {
    await ctx.render('teams/new', {
      team: ctx.orm.team.build(ctx.request.body),
      errors: validationError.errors,
      submitTeamPath: ctx.router.url('teamCreate'),
    });
  }
});

router.patch('teamUpdate', '/:id', async (ctx) => {
  const team = await ctx.orm.team.findById(ctx.params.id);
  try {
    await team.update(ctx.request.body);
    ctx.redirect(ctx.router.url('team', { id: team.id }));
  } catch (validationError) {
    await ctx.render('teams/edit', {
      team,
      errors: validationError.errors,
      sumbitTeamPath: ctx.router.url('teamUpdate', team.id),
    });
  }
});

router.get('team', '/:id', async (ctx) => {
  const team = await ctx.orm.team.findById(ctx.params.id);
  await ctx.render('teams/show', {
    team,
    teamsPath: ctx.router.url('teams'),
    editTeamPath: ctx.router.url('teamEdit', team.id),
    deleteTeamPath: ctx.router.url('teamDelete', team.id),
  });
});

router.delete('teamDelete', '/:id', async (ctx) => {
  const team = await ctx.orm.team.findById(ctx.params.id);
  await team.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('teams'));
});


module.exports = router;
