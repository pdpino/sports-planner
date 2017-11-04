const KoaRouter = require('koa-router');
const teamMembersRouter = require('./teamMembers');
const teamMatchesRouter = require('./teamMatches');
const teamCommentsRouter = require('./teamComments');

const router = new KoaRouter();

router.get('teams', '/', async (ctx) => {
  const teams = await ctx.orm.team.scope('withSport').findAll();

  await ctx.render('teams/index', {
    teams,
    hasCreatePermission: ctx.state.isPlayerLoggedIn,
    teamPath: team => ctx.router.url('team', { id: team.id }),
    newTeamPath: ctx.router.url('teamNew'),
  });
});

router.get('teamNew', '/new', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const team = ctx.orm.team.build();
  await ctx.render('teams/new', {
    team,
    sports: ctx.state.allSports,
    submitTeamPath: ctx.router.url('teamCreate'),
    cancelPath: ctx.router.url('teams'),
  });
});

router.post('teamCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  try {
    const team = await ctx.orm.team.create(ctx.request.body);
    ctx.state.currentPlayer.addTeam(team, {
      through: { isCaptain: true }
    });
    ctx.redirect(ctx.router.url('team', { id: team.id }));
  } catch (validationError) {
    await ctx.render('teams/new', {
      team: ctx.orm.team.build(ctx.request.body),
      errors: ctx.parseValidationError(validationError),
      sports: ctx.state.allSports,
      submitTeamPath: ctx.router.url('teamCreate'),
      cancelPath: ctx.router.url('teams'),
    });
  }
});

router.get('teamEdit', '/:id/edit', async (ctx) => {
  const team = await ctx.findById(ctx.orm.team, ctx.params.id);

  await ctx.requirePlayerModifyPermission(team);

  await ctx.render('teams/edit', {
    team,
    sports: ctx.state.allSports,
    submitTeamPath: ctx.router.url('teamUpdate', team.id),
    cancelPath: ctx.router.url('team', { id: ctx.params.id }),
  });
});

router.patch('teamUpdate', '/:id', async (ctx) => {
  const team = await ctx.findById(ctx.orm.team, ctx.params.id);

  await ctx.requirePlayerModifyPermission(team);

  try {
    await team.update(ctx.request.body);
    ctx.redirect(ctx.router.url('team', { id: team.id }));
  } catch (validationError) {
    await ctx.render('teams/edit', {
      team,
      errors: ctx.parseValidationError(validationError),
      sports: ctx.state.allSports,
      submitTeamPath: ctx.router.url('teamUpdate', team.id),
      cancelPath: ctx.router.url('team', { id: ctx.params.id }),
    });
  }
});

router.get('team', '/:id', async (ctx) => {
  const team = await ctx.findById(ctx.orm.team.scope('withSport'), ctx.params.id);
  const sport = await team.getSport();
  const teamMembers = await team.getPlayers();
  const teamMatches = await team.getMatches();
  const hasModifyPermission = await team.hasModifyPermission(ctx.state.currentPlayer);
  const canSeePrivateComments = await team.hasPlayer(ctx.state.currentPlayer);
  const publicComments = await team.getPublicComments();
  const privateComments = (canSeePrivateComments) ? await team.getPrivateComments() : [];

  await ctx.render('teams/show', {
    team,
    teamMembers,
    teamMatches,
    hasModifyPermission,
    canComment: ctx.state.isPlayerLoggedIn,
    canSeePrivateComments,
    publicComments,
    privateComments,
    createCommentPath: ctx.router.url('teamCommentCreate', { teamId: team.id }),
    deleteCommentPath: (comment) => ctx.router.url('teamCommentDelete', {
      teamId: team.id,
      id: comment.id
    }),
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
  const team = await ctx.findById(ctx.orm.team, ctx.params.id);

  await ctx.requirePlayerModifyPermission(team);

  await team.destroy();
  ctx.redirect(ctx.router.url('teams'));
});

router.use(
  '/:teamId/players',
  async (ctx, next) => {
    ctx.state.team = await ctx.findById(ctx.orm.team, ctx.params.teamId);

    await ctx.requirePlayerModifyPermission(ctx.state.team);

    const friends = await ctx.state.currentPlayer.getAllFriends();
    const teamMembers = await ctx.state.team.getPlayers();
    ctx.state.invitablePlayers = ctx.substract(friends, teamMembers);

    return next();
  },
  teamMembersRouter.routes(),
);

router.use(
  '/:teamId/matches',
  async (ctx, next) => {
    ctx.state.team = await ctx.findById(ctx.orm.team, ctx.params.teamId);

    await ctx.requirePlayerModifyPermission(ctx.state.team);

    ctx.state.teamMembers = await ctx.state.team.getPlayers();

    const visibleMatches = await ctx.getVisibleMatches();
    const teamMatches = await ctx.state.team.getMatches();
    ctx.state.joinableMatches = ctx.substract(visibleMatches, teamMatches);
    return next();
  },
  teamMatchesRouter.routes(),
);

router.use(
  '/:teamId/comments',
  async (ctx, next) => {
    ctx.state.team = await ctx.findById(ctx.orm.team, ctx.params.teamId);
    return next();
  },
  teamCommentsRouter.routes(),
);

module.exports = router;
