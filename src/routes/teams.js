const KoaRouter = require('koa-router');
const teamMembersRouter = require('./teamMembers');
const teamCommentsRouter = require('./teamComments');
const teamMatchesRouter = require('./teamMatches');

const router = new KoaRouter();

/** Finds the name of the sportId, given all the sports **/
function findSportName(sportId, allSports){
  // OPTIMIZE? use a model function?
  const sportsFound = allSports.filter(sport => sport.id == sportId);
  return (sportsFound[0]) ? sportsFound[0].name : null;
}

router.get('teams', '/', async (ctx) => {
  const teams = await ctx.orm.team.findAll();

  await ctx.render('teams/index', {
    teams,
    sports: ctx.state.sports,
    hasCreatePermission: ctx.state.isPlayerLoggedIn,
    getTeamSport: (team) => findSportName(team.sportId, ctx.state.sports),
    teamPath: team => ctx.router.url('team', { id: team.id }),
    newTeamPath: ctx.router.url('teamNew'),
  });
});

router.get('teamNew', '/new', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const team = ctx.orm.team.build();
  await ctx.render('teams/new', {
    team,
    sports: ctx.state.sports,
    submitTeamPath: ctx.router.url('teamCreate'),
    cancelPath: ctx.router.url('teams'),
  });
});

router.post('teamCreate', '/', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  try {
    const team = await ctx.orm.team.create(ctx.request.body);
    ctx.state.currentPlayer.addTeam(team, {
      through: { isCaptain: true }
    });
    ctx.redirect(ctx.router.url('team', { id: team.id }));
  } catch (validationError) {
    await ctx.render('teams/new', {
      team: ctx.orm.team.build(ctx.request.body),
      errors: ctx.state.parseValidationError(validationError),
      sports: ctx.state.sports,
      submitTeamPath: ctx.router.url('teamCreate'),
      cancelPath: ctx.router.url('teams'),
    });
  }
});

router.get('teamEdit', '/:id/edit', async (ctx) => {
  const team = await ctx.state.findById(ctx.orm.team, ctx.params.id);

  await ctx.state.requirePlayerModifyPermission(ctx, team);

  await ctx.render('teams/edit', {
    team,
    sports: ctx.state.sports,
    submitTeamPath: ctx.router.url('teamUpdate', team.id),
    cancelPath: ctx.router.url('team', { id: ctx.params.id }),
  });
});

router.patch('teamUpdate', '/:id', async (ctx) => {
  const team = await ctx.state.findById(ctx.orm.team, ctx.params.id);

  await ctx.state.requirePlayerModifyPermission(ctx, team);

  try {
    await team.update(ctx.request.body);
    ctx.redirect(ctx.router.url('team', { id: team.id }));
  } catch (validationError) {
    await ctx.render('teams/edit', {
      team,
      errors: ctx.state.parseValidationError(validationError),
      sports: ctx.state.sports,
      submitTeamPath: ctx.router.url('teamUpdate', team.id),
      cancelPath: ctx.router.url('team', { id: ctx.params.id }),
    });
  }
});

router.get('team', '/:id', async (ctx) => {
  const team = await ctx.state.findById(ctx.orm.team, ctx.params.id);
  const sport = await team.getSport();
  const teamMembers = await team.getPlayers();
  const teamMatches = await team.getMatches();
  const hasModifyPermission = await team.hasModifyPermission(ctx.state.currentPlayer);
  const privateCommenters = await team.getPrivateComments();
  const publicCommenters = await team.getPublicComments();

  await ctx.render('teams/show', {
    team,
    teamMembers,
    teamMatches,
    hasModifyPermission,
    hasCreatePermission: ctx.state.isPlayerLoggedIn,
    privateCommenters,
    publicCommenters,
    createTeamCommentPath: ctx.router.url('teamCommentCreate', { teamId: team.id }),
    sport: sport.name,
    editTeamPath: ctx.router.url('teamEdit', team.id),
    deleteTeamPath: ctx.router.url('teamDelete', team.id),
    newTeamMemberPath: ctx.router.url('teamMemberNew', { teamId: team.id } ),
    editTeamMemberPath: (player) => ctx.router.url('teamMemberEdit', {
      teamId: team.id,
      id: player.id
    }),
    newTeamMatchPath: ctx.router.url('teamMatchNew', { teamId: team.id } ),
    editTeamMatchPath: (match) => ctx.router.url('teamMatchEdit', {
      teamId: team.id,
      id: match.id
    }),
  });
});

router.delete('teamDelete', '/:id', async (ctx) => {
  const team = await ctx.state.findById(ctx.orm.team, ctx.params.id);

  await ctx.state.requirePlayerModifyPermission(ctx, team);

  await team.destroy();
  ctx.redirect(ctx.router.url('teams'));
});

router.use(
  '/:teamId/players',
  async (ctx, next) => {
    ctx.state.team = await ctx.state.findById(ctx.orm.team, ctx.params.teamId);

    await ctx.state.requirePlayerModifyPermission(ctx, ctx.state.team);

    ctx.state.teamMembers = await ctx.state.team.getPlayers();
    ctx.state.invitablePlayers = await ctx.state.currentPlayer.getAllFriends();
    await next();
  },
  teamMembersRouter.routes(),
);

router.use(
  '/:teamId/matches',
  async (ctx, next) => {
    ctx.state.team = await ctx.state.findById(ctx.orm.team, ctx.params.teamId);

    await ctx.state.requirePlayerModifyPermission(ctx, ctx.state.team);

    ctx.state.teamMembers = await ctx.state.team.getPlayers();
    ctx.state.teamMatches = await ctx.state.team.getMatches();
    ctx.state.visibleMatches = await ctx.state.getVisibleMatches(ctx);
    await next();
  },
  teamMatchesRouter.routes(),
);

router.use(
  '/:teamId/comments',
  async (ctx, next) => {
    ctx.state.team = await ctx.state.findById(ctx.orm.team, ctx.params.teamId);
    await next();
  },
  teamCommentsRouter.routes(),
);

module.exports = router;
