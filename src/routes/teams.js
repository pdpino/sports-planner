const KoaRouter = require('koa-router');
const teamMembersRouter = require('./teamMembers');

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
    hasCreatePermission: ctx.state.isLoggedIn,
    getTeamSport: (team) => findSportName(team.sportId, ctx.state.sports),
    teamPath: team => ctx.router.url('team', { id: team.id }),
    newTeamPath: ctx.router.url('teamNew'),
  });
});

router.get('teamNew', '/new', async (ctx) => {
  if (!ctx.state.requirePlayerLogin(ctx)) return;

  const team = ctx.orm.team.build();
  await ctx.render('teams/new', {
    team,
    sports: ctx.state.sports,
    submitTeamPath: ctx.router.url('teamCreate'),
    cancelPath: ctx.router.url('teams'),
  });
});

router.post('teamCreate', '/', async (ctx) => {
  if (!ctx.state.requirePlayerLogin(ctx)) return;

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
  if (!ctx.state.requirePlayerLogin(ctx)) return; // TODO: require correct user

  const team = await ctx.orm.team.findById(ctx.params.id);
  await ctx.render('teams/edit', {
    team,
    sports: ctx.state.sports,
    submitTeamPath: ctx.router.url('teamUpdate', team.id),
    cancelPath: ctx.router.url('team', { id: ctx.params.id }),
  });
});

router.patch('teamUpdate', '/:id', async (ctx) => {
  if (!ctx.state.requirePlayerLogin(ctx)) return; // TODO: require correct user

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
  const teamMembers = await team.getPlayers();
  const hasModifyPermission = ctx.state.currentPlayer && await team.hasPlayer(ctx.state.currentPlayer, {
    through: {
      where: { isCaptain: true }
    }
  });

  await ctx.render('teams/show', {
    team,
    teamMembers,
    hasModifyPermission,
    sport: sport.name,
    teamsPath: ctx.router.url('teams'),
    editTeamPath: ctx.router.url('teamEdit', team.id),
    deleteTeamPath: ctx.router.url('teamDelete', team.id),
    getPlayerPath: (player) => ctx.router.url('player', player.id),
    editTeamMemberPath: (player) => ctx.router.url('teamMemberEdit', {
      teamId: team.id,
      id: player.id
    }),
    newTeamMemberPath: ctx.router.url('teamMemberNew', { teamId: team.id } ),
    playersPath: ctx.router.url('teams'),
  });
});

router.delete('teamDelete', '/:id', async (ctx) => {
  if (!ctx.state.requirePlayerLogin(ctx)) return; // TODO: require correct user

  const team = await ctx.orm.team.findById(ctx.params.id);
  await team.destroy();
  ctx.redirect(ctx.router.url('teams'));
});

router.use(
  '/:teamId/players',
  async (ctx, next) => {
    ctx.state.team = await ctx.orm.team.findById(ctx.params.teamId);
    ctx.state.teamMembers = await ctx.state.team.getPlayers();
    ctx.state.players = await ctx.orm.player.findAll();
    await next();
  },
  teamMembersRouter.routes(),
);

module.exports = router;
