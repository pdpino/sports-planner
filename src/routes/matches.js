const _ = require('lodash');
const KoaRouter = require('koa-router');

const invitedPlayersRouter = require('./invitedPlayers');
const invitedTeamsRouter = require('./invitedTeams');

/** Given a match and the currentPlayer logged in, boolean indicating modify permission **/
async function hasModifyMatchPermission(match, currentPlayer){
  return currentPlayer && await match.hasPlayer(currentPlayer, {
    through: {
      where: { isAdmin: true }
    }
  });
}

/** Require modify team permissions, else redirect to home **/
async function requireModifyMatchPermission(ctx, match){
  const hasModifyPermission = await hasModifyMatchPermission(match, ctx.state.currentPlayer);
  if(!hasModifyPermission){
    ctx.redirect('/');
    return false; // Require failed
  }
  return true; // Require passed
}
const router = new KoaRouter();

/** Filter the parameters passed by the matches/_form.html.ejs (create or edit a match)*/
function getMatchParams(params){
  const filteredParams = _.pick(params, 'name', 'isPublic', 'date', 'sportId');

  /* checkbox input passes 'on' when checked and null when not-checked. Parse this to boolean */
  filteredParams.isPublic = Boolean(filteredParams.isPublic);
  filteredParams.name = filteredParams.name || '';

  return filteredParams;
}

/** Transform an isPlayerInvited status to a message for the user
 * HACK: this shouldn't be here (should be in isPlayerInvited)
 **/
function getStatusMessage(status){
  const statusMessages = {
    'sentToTeam': 'Esperando confirmación del capitán del equipo',
    'sentByTeam': 'Esperando confirmación del administrador del partido',
    'teamRejected': 'Equipo rechazado',
    'rejectedByTeam': 'No asistirá',
    'accepted': 'Asistirá'
  };
  return statusMessages[status] || 'no status';
}

/** Get the default name for a match **/
function getDefaultName(player){
  return "Partido de " + player.firstName;
}

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.orm.match.findAll();
  await ctx.render('matches/index', {
    matches,
    sports: ctx.state.sports,
    hasCreatePermission: ctx.state.isLoggedIn,
    matchPath: match => ctx.router.url('match', { id: match.id }),
    newMatchPath: ctx.router.url('matchNew'),
  });
});

router.get('matchNew', '/new', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const match = ctx.orm.match.build();
  match.name = getDefaultName(ctx.state.currentPlayer);

  await ctx.render('matches/new', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchCreate'),
    cancelPath: ctx.router.url('matches'),
  });
});

router.post('matchCreate', '/', async (ctx) => {
  const params = getMatchParams(ctx.request.body);

  ctx.state.requirePlayerLoggedIn(ctx);

  // REVIEW: should this be in the model? (beforeCreate hook?) (but the model doesn't know the creator)
  params.name = params.name || getDefaultName(ctx.state.currentPlayer);

  try {
    const match = await ctx.orm.match.create(params);
    await ctx.state.currentPlayer.addMatch(match.id, {
      through: {
        isAdmin: true,
        status: "accepted"
      }
    });
    ctx.redirect(ctx.router.url('match', match.id ));
  } catch (validationError) {
    console.log("VALIDATION ERROR WHEN CREATING MATCH: ", validationError);

    await ctx.render('matches/new', {
      match: ctx.orm.match.build(params),
      errors: validationError.errors,
      sports: ctx.state.sports,
      submitMatchPath: ctx.router.url('matchCreate'),
      cancelPath: ctx.router.url('matches'),
    });
  }
});

router.get('matchEdit', '/:id/edit', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  if (! await requireModifyMatchPermission(ctx, match)) return;
  await ctx.render('matches/edit', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchUpdate', match.id),
    cancelPath: ctx.router.url('match', { id: ctx.params.id }),
  });
});

router.patch('matchUpdate', '/:id', async (ctx) => {
  getMatchParams(ctx.request.bosdy);
  const match = await ctx.orm.match.findById(ctx.params.id);
  if (! await requireModifyMatchPermission(ctx, match)) return;
  try {
    await match.update(ctx.request.body);
    ctx.redirect(ctx.router.url('match', { id: match.id }));
  } catch (validationError) {
    await ctx.render('matches/edit', {
      match,
      errors: validationError.errors,
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
  const hasModifyPermission = await hasModifyMatchPermission(match, ctx.state.currentPlayer);

  await ctx.render('matches/show', {
    match,
    invitedPlayers,
    hasModifyPermission,
    sport: sport.name,
    getStatusMessage,
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
  if (! await requireModifyMatchPermission(ctx, match)) return;
  const match = await ctx.orm.match.findById(ctx.params.id);
  await match.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('matches'));
});

router.use(
  '/:matchId/players',
  async (ctx, next) => {
    const match = await ctx.orm.match.findById(ctx.params.matchId);

    if (! await requireModifyMatchPermission(ctx, match)) return;

    ctx.state.players = await ctx.orm.player.findAll();

    ctx.state.match = match;
    ctx.state.invitedPlayers = await ctx.state.match.getPlayers();
    await next();
  },
  invitedPlayersRouter.routes(),
);

router.use(
  '/:matchId/teams',
  async (ctx, next) => {
    const match = await ctx.orm.match.findById(ctx.params.matchId);

    if (! await requireModifyMatchPermission(ctx, match)) return;

    ctx.state.match = match;
    ctx.state.teams = await ctx.orm.team.findAll();
    ctx.state.invitedTeams = await ctx.state.match.getTeams();
    await next();
  },
  invitedTeamsRouter.routes(),
);

module.exports = router;
