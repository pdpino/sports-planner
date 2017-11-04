const KoaRouter = require('koa-router');
const notifications = require('../services/notifications');

const router = new KoaRouter();

router.get('invitedTeamNew', '/new', async (ctx) => {
  await ctx.render('invitedTeams/new', {
    match: ctx.state.match,
    // invitableTeams: ctx.state.invitableTeams,
    submitInvitedTeamPath: ctx.router.url('invitedTeamCreate', { matchId: ctx.state.match.id }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.post('invitedTeamCreate', '/', async (ctx) => {
  const team = await ctx.findById(ctx.orm.team, ctx.request.body.teamId);
  const teamCaptain = await team.getCaptain();

  try {
    await ctx.state.match.inviteTeam(team);
    if(teamCaptain){
      await notifications.inviteTeamToMatch(ctx, ctx.state.currentPlayer, team, teamCaptain, ctx.state.match);
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
  const invitedTeam = await ctx.findAssociatedById(ctx.state.match, 'getTeams', ctx.params.id);

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
  const invitedTeam = await ctx.findAssociatedById(ctx.state.match, 'getTeams', ctx.params.id);

  try {
    await ctx.state.match.updateTeamInvitation(invitedTeam, ctx.request.body.status);
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
