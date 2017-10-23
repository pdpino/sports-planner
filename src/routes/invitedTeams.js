const sendInvitationTeamMail = require('../mailers/invitation-team');
const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedTeam is in invitedTeams **/
function isTeamInvited(searchedTeam, invitedTeams){
  return Boolean(invitedTeams.find((team) => team.id == searchedTeam.id));
}

/** Return the invitable teams (all but the ones already invited) **/
function getInvitableTeams(allTeams, invitedTeams){
  // OPTIMIZE
  return allTeams.filter( (anyTeam) => {
    return !isTeamInvited(anyTeam, invitedTeams);
  });
}

/** Wrapper to find an specific invited team **/
async function findInvitedTeamById(match, teamId){
  // OPTIMIZE?
  const invitedTeams = await match.getTeams( { where: { id: teamId } } );
  return (invitedTeams.length == 1) ? invitedTeams[0] : null;
}

router.get('invitedTeamNew', '/new', async (ctx) => {
  await ctx.render('invitedTeams/new', {
    match: ctx.state.match,
    invitableTeams: getInvitableTeams(ctx.state.teams, ctx.state.invitedTeams),
    submitInvitedTeamPath: ctx.router.url('invitedTeamCreate', { matchId: ctx.state.match.id }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.post('invitedTeamCreate', '/', async (ctx) => {
  const team = await ctx.state.findById(ctx.orm.team, ctx.request.body.teamId);
  const teamCaptain = await team.getCaptain();

  try {
    await ctx.state.match.addTeam(team, {
      through: { status: 'sent' } // HACK: invitation status harcoded
    });
    if(teamCaptain){
      sendInvitationTeamMail(ctx, teamCaptain.email, {
        eventType: 'Partido',
        eventName: ctx.state.match.name,
        invitedBy: ctx.state.currentPlayer.getName(),
        teamName: team.name,
      });
    }
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedTeams/new', {
      match: ctx.state.match,
      invitableTeams: getInvitableTeams(ctx.state.teams, ctx.state.invitedTeams),
      errors: ctx.state.parseValidationError(validationError),
      submitInvitedTeamPath: ctx.router.url('invitedTeamCreate', { matchId: ctx.state.match.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.get('invitedTeamEdit', '/:id/edit', async (ctx) => {
  const invitedTeam = await findInvitedTeamById(ctx.state.match, ctx.params.id);

  await ctx.render('invitedTeams/edit', {
    match: ctx.state.match,
    team: invitedTeam,
    chooseStatuses: ctx.state.eligibleStatuses(invitedTeam.isTeamInvited.status, true),
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
  const invitedTeam = await findInvitedTeamById(ctx.state.match, ctx.params.id);

  const newStatus = ctx.request.body.status || invitedTeam.isTeamInvited.status;

  try {
    await ctx.state.match.addTeam(invitedTeam, { through: { status: newStatus }});
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedTeams/edit', {
      match: ctx.state.match,
      team: invitedTeam,
      chooseStatuses: ctx.state.eligibleStatuses(invitedTeam.isTeamInvited.status, true),
      errors: ctx.state.parseValidationError(validationError),
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
