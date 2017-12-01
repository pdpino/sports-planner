const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('invitedTeamNew', '/new', async (ctx) => {
  ctx.requireMatchNotDone(ctx.state.match);

  await ctx.render('invitedTeams/new', {
    match: ctx.state.match,
    // invitableTeams: ctx.state.invitableTeams,
    submitInvitedTeamPath: ctx.router.url('invitedTeamCreate', { matchId: ctx.state.match.id }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.post('invitedTeamCreate', '/', async (ctx) => {
  ctx.requireMatchNotDone(ctx.state.match);

  const team = await ctx.findById(ctx.orm.team, ctx.request.body.teamId);
  const teamCaptain = await team.getCaptain();

  try {
    await ctx.state.match.inviteTeam(team);
    if(teamCaptain){
      await ctx.inviteTeamToMatch(ctx.state.currentPlayer, team, teamCaptain, ctx.state.match);
    }
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedTeams/new', {
      match: ctx.state.match,
      // invitableTeams: ctx.state.invitableTeams,
      errors: ctx.parseValidationError(validationError),
      submitInvitedTeamPath: ctx.router.url('invitedTeamCreate', { matchId: ctx.state.match.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.get('invitedTeamEdit', '/:id/edit', async (ctx) => {
  ctx.requireMatchNotDone(ctx.state.match);
  const invitedTeam = await ctx.state.match.getTeam(ctx.params.id);

  await ctx.render('invitedTeams/edit', {
    match: ctx.state.match,
    team: invitedTeam,
    chooseStatuses: ctx.eligibleStatuses(invitedTeam.isTeamInvited.status, true),
    submitInvitedTeamPath: ctx.router.url('invitedTeamUpdate', {
      matchId: ctx.state.match.id,
      id: invitedTeam.id
    }),
    deleteInvitedTeamPath: ctx.router.url('invitedTeamDelete', {
      matchId: ctx.state.match.id,
      id: invitedTeam.id
    }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.patch('invitedTeamUpdate', '/:id', async (ctx) => {
  ctx.requireMatchNotDone(ctx.state.match);
  const invitedTeam = await ctx.state.match.getTeam(ctx.params.id);
  const newStatus = ctx.request.body.status;
  const statusChanged = newStatus !== invitedTeam.isTeamInvited.status;
  const teamMembers = await invitedTeam.getPlayers();

  try {
    await ctx.state.match.updateTeamInvitation(invitedTeam, newStatus);

    // HACK: this is copied from teamMatches
    if(statusChanged && newStatus == 'accepted'){ // HACK: status hardcoded
      // Invite all of its players to the game
      await ctx.state.match.invitePlayers(teamMembers);
    }

    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedTeams/edit', {
      match: ctx.state.match,
      team: invitedTeam,
      chooseStatuses: ctx.eligibleStatuses(invitedTeam.isTeamInvited.status, true),
      errors: ctx.parseValidationError(validationError),
      submitInvitedTeamPath: ctx.router.url('invitedTeamUpdate', {
        matchId: ctx.state.match.id,
        id: invitedTeam.id
      }),
      deleteInvitedTeamPath: ctx.router.url('invitedTeamDelete', {
        matchId: ctx.state.match.id,
        id: invitedTeam.id
      }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.delete('invitedTeamDelete', '/:id', async (ctx) => {
   await ctx.state.match.removeTeam(ctx.params.id);
   ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
 });

module.exports = router;
