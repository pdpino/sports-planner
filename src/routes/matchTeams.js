const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedTeam is in invitedTeams **/
function isTeamInvited(searchedTeam, invitedTeams){
  return Boolean(invitedTeams.find((team) => team.id == searchedTeam.id));
}

/** Return the invitable teams (all but the ones already invited) **/
function getInvitableTeams(allTeams, invitedTeams){
  // OPTIMIZE ???
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

router.get('matchTeamNew', '/new', async (ctx) => {
  await ctx.render('matchTeams/new', {
    match: ctx.state.match,
    invitableTeams: getInvitableTeams(ctx.state.teams, ctx.state.invitedTeams),
    submitMatchTeamPath: ctx.router.url('matchTeamCreate', { matchId: ctx.state.match.id }),
    cancelPath: ctx.router.url('match', { id: ctx.state .match.id })
  });
});

router.post('matchTeamCreate', '/', async (ctx) => {
  try {
    await ctx.state.match.addTeam(ctx.request.body.teamId, { through: { status: "sentToTeam" }});
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    console.log("###### validation error when inviting team to a match: ", validationError); // DEBUG
    await ctx.render('matchTeams/new', {
      match: ctx.state.match,
      playersNotInvited: getInvitableTeams(ctx.state.teams, ctx.state.invitedTeams),
      errors: validationError.errors,
      submitMatchTeamPath: ctx.router.url('matchTeamCreate', { matchId: ctx.state.match.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.get('matchTeamEdit', '/:id/edit', async (ctx) => {
  const invitedTeam = await findInvitedTeamById(ctx.state.match, ctx.params.id);

  console.log("INVITED TEAM: ", invitedTeam.isTeamInvited.status);

  await ctx.render('matchTeams/edit', {
    match: ctx.state.match,
    team: invitedTeam,
    submitMatchTeamPath: ctx.router.url('matchTeamUpdate', {
      matchId: ctx.state.match.id,
      id: invitedTeam.id
    }),
    deleteMatchTeamPath: ctx.router.url('matchTeamDelete', {
      matchId: ctx.state.match.id,
      id: invitedTeam.id
    }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.patch('matchTeamUpdate', '/:id', async (ctx) => {
  const invitedTeam = await findInvitedTeamById(ctx.state.match, ctx.params.id);

  const newStatus = ctx.request.body.status || invitedTeam.isTeamInvited.status;

  try {
    await ctx.state.match.addTeam(invitedTeam, { through: { status: newStatus }});
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    console.log("###### validation error when updating match-team: ", validationError); // DEBUG
    await ctx.render('matchTeams/edit', {
      match: ctx.state.match,
      team: invitedTeam,
      errors: validationError.errors,
      submitMatchTeamPath: ctx.router.url('matchTeamUpdate', {
        matchId: ctx.state.match.id,
        id: invitedTeam.id
      }),
      deleteMatchTeamPath: ctx.router.url('matchTeamDelete', {
        matchId: ctx.state.match.id,
        id: invitedTeam.id
      }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.delete('matchTeamDelete', '/:id', async (ctx) => {
   await ctx.state.match.removePlayer(ctx.params.id);
   ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
 });


module.exports = router;
