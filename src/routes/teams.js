const KoaRouter = require('koa-router');
const playerTeamsRouter = require('./teamPlayers');

const router = new KoaRouter();

router.get('teams', '/', async (ctx) => {
  const teams = await ctx.orm.team.findAll();
  await ctx.render('teams/index', {
    teams,
    sports: ctx.state.sports,
    getTeamSport: (team) => { // FIXME
      const matchSports = ctx.state.sports.filter(sport => sport.id === team.sportId); // OPTIMIZE ?
      return (matchSports[0]) ? matchSports[0].name : team.sportId; // avoid internal server error
    },
    teamPath: team => ctx.router.url('team', { id: team.id }),
    newTeamPath: ctx.router.url('teamNew'),
  });
});

router.get('teamNew', '/new', async (ctx) => {
  const team = ctx.orm.team.build();
  await ctx.render('teams/new', {
    team,
    sports: ctx.state.sports,
    submitTeamPath: ctx.router.url('teamCreate'),
    cancelPath: ctx.router.url('teams'),
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
      sports: ctx.state.sports,
      submitTeamPath: ctx.router.url('teamCreate'),
      cancelPath: ctx.router.url('teams'),
    });
  }
});

router.get('teamEdit', '/:id/edit', async (ctx) => {
  const team = await ctx.orm.team.findById(ctx.params.id);
  await ctx.render('teams/edit', {
    team,
    sports: ctx.state.sports,
    submitTeamPath: ctx.router.url('teamUpdate', team.id),
    cancelPath: ctx.router.url('team', { id: ctx.params.id }),
  });
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
      sports: ctx.state.sports,
      submitTeamPath: ctx.router.url('teamUpdate', team.id),
      cancelPath: ctx.router.url('team', { id: ctx.params.id }),
    });
  }
});

router.get('team', '/:id', async (ctx) => {
  const team = await ctx.orm.team.findById(ctx.params.id);
  const sport = await ctx.orm.sport.findById(team.sportId);
  const memberOfTeams = await team.getPlayers(); // FIXME: change name?
  await ctx.render('teams/show', {
    team,
    memberOfTeams,
    sport: sport.name,
    teamsPath: ctx.router.url('teams'),
    editTeamPath: ctx.router.url('teamEdit', team.id),
    deleteTeamPath: ctx.router.url('teamDelete', team.id),
    editTeamPlayerPath: (player) => ctx.router.url('teamPlayerEdit', {
      teamId: team.id,
      id: player.id
    }),
    newTeamPlayerPath: ctx.router.url('teamPlayerNew', { teamId: team.id } ),
    playersPath: ctx.router.url('teams'),
  });
});

router.delete('teamDelete', '/:id', async (ctx) => {
  const team = await ctx.orm.team.findById(ctx.params.id);
  await team.destroy();
  ctx.redirect(ctx.router.url('teams'));
});

router.use(
  '/:teamId/teams',
  async (ctx, next) => {
    ctx.state.players = await ctx.orm.player.findAll();
    ctx.state.team = await ctx.orm.team.findById(ctx.params.teamId);
    ctx.state.memberOfTeams = await ctx.state.team.getPlayers(); // FIXME: change name
    await next();
  },
  playerTeamsRouter.routes(),
);

module.exports = router;
