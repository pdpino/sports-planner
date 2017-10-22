const _ = require('lodash');
const moment = require('moment');
const KoaRouter = require('koa-router');

const invitedPlayersRouter = require('./invitedPlayers');
const invitedTeamsRouter = require('./invitedTeams');
const router = new KoaRouter();

/**
 * Filter the parameters passed by the matches/_form.html.ejs (create or edit a match)
 * Assumes that there is a player logged in (ctx.state.currentPlayer is defined)
 */
function getMatchParams(ctx){
  const params = ctx.request.body;
  const filteredParams = _.pick(params, 'name', 'isPublic', 'sportId', 'dateYear', 'dateMonth', 'dateDay', 'dateHour', 'dateMinute');

  // Build date
  filteredParams.date = moment(`${params.dateYear} ${params.dateMonth} ${params.dateDay} ${params.dateHour} ${params.dateMinute}`, "YYYY MM DD H:mm");

  if(!filteredParams.date.isValid()){
    // REVIEW: shouldn't this be in the model?
    filteredParams.date = null;
  }

  // checkbox input passes 'on' when checked and null when not-checked. Parse this to boolean
  filteredParams.isPublic = Boolean(filteredParams.isPublic);

  // Assure name (REVIEW: move this to model? hook? but the model doesnt know the currentPlayer)
  filteredParams.name = filteredParams.name || ctx.orm.match.getDefaultName(ctx.state.currentPlayer);

  return filteredParams;
}

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.orm.match.findAll();
  await ctx.render('matches/index', {
    matches,
    sports: ctx.state.sports,
    hasCreatePermission: ctx.state.isPlayerLoggedIn,
    matchPath: match => ctx.router.url('match', { id: match.id }),
    newMatchPath: ctx.router.url('matchNew'),
  });
});

router.get('matchNew', '/new', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const match = ctx.orm.match.build();
  match.name = ctx.orm.match.getDefaultName(ctx.state.currentPlayer);

  await ctx.render('matches/new', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchCreate'),
    cancelPath: ctx.router.url('matches'),
  });
});

router.post('matchCreate', '/', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const params = getMatchParams(ctx);

  try {
    const match = await ctx.orm.match.create(params);
    await ctx.state.currentPlayer.addMatch(match.id, {
      through: {
        isAdmin: true,
        status: "accepted" // HACK: invitation status harcoded
      }
    });
    ctx.redirect(ctx.router.url('match', match.id ));
  } catch (validationError) {
    await ctx.render('matches/new', {
      match: ctx.orm.match.build(params),
      errors: ctx.state.parseValidationError(validationError),
      sports: ctx.state.sports,
      submitMatchPath: ctx.router.url('matchCreate'),
      cancelPath: ctx.router.url('matches'),
    });
  }
});

router.get('matchEdit', '/:id/edit', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  await ctx.state.requirePlayerModifyPermission(ctx, match);

  await ctx.render('matches/edit', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchUpdate', match.id),
    cancelPath: ctx.router.url('match', { id: ctx.params.id }),
  });
});

router.patch('matchUpdate', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  await ctx.state.requirePlayerModifyPermission(ctx, match);

  const params = getMatchParams(ctx);
  try {
    await match.update(params);
    ctx.redirect(ctx.router.url('match', { id: match.id }));
  } catch (validationError) {
    await ctx.render('matches/edit', {
      match,
      errors: ctx.state.parseValidationError(validationError),
      sports: ctx.state.sports,
      submitMatchPath: ctx.router.url('matchUpdate', match.id),
      cancelPath: ctx.router.url('match', { id: ctx.params.id }),
    });
  }
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  const sport = await ctx.orm.sport.findById(match.sportId);
  const invitedPlayers = await match.getPlayers();
  const invitedTeams = await match.getTeams();
  const hasModifyPermission = await match.hasModifyPermission(ctx.state.currentPlayer);

  await ctx.render('matches/show', {
    match,
    invitedPlayers,
    hasModifyPermission,
    sport: sport.name,
    invitedTeams,
    editMatchPath: ctx.router.url('matchEdit', match.id),
    newInvitedPlayerPath: ctx.router.url('invitedPlayerNew', { matchId: match.id } ),
    newInvitedTeamPath: ctx.router.url('invitedTeamNew', { matchId: match.id } ),
    editInvitedPlayerPath: (player) => ctx.router.url('invitedPlayerEdit', {
      matchId: match.id,
      id: player.id
    }),
    editInvitedTeamPath: (team) => ctx.router.url('invitedTeamEdit', {
      matchId: match.id,
      id: team.id
    }),
    deleteMatchPath: ctx.router.url('matchDelete', match.id),
  });
});

router.delete('matchDelete', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);

  await ctx.state.requirePlayerModifyPermission(ctx, match);

  await match.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('matches'));
});

router.use(
  '/:matchId/players',
  async (ctx, next) => {
    ctx.state.match = await ctx.orm.match.findById(ctx.params.matchId);

    await ctx.state.requirePlayerModifyPermission(ctx, ctx.state.match);

    ctx.state.players = await ctx.orm.player.findAll();
    ctx.state.invitedPlayers = await ctx.state.match.getPlayers();
    await next();
  },
  invitedPlayersRouter.routes(),
);

router.use(
  '/:matchId/teams',
  async (ctx, next) => {
    ctx.state.match = await ctx.orm.match.findById(ctx.params.matchId);

    await ctx.state.requirePlayerModifyPermission(ctx, ctx.state.match);

    ctx.state.teams = await ctx.orm.team.findAll();
    ctx.state.invitedTeams = await ctx.state.match.getTeams();
    await next();
  },
  invitedTeamsRouter.routes(),
);

module.exports = router;
