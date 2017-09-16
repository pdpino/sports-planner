const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Check if a player is in a list of teamMembers **/
function isTeamMember(searchedPlayer, teamMembers){
  return Boolean(teamMembers.find((player) => player.id == searchedPlayer.id));
}

/** Return the difference between allTeams and playTeams **/
function getInvitablePlayers(allPlayers, teamMembers){ // CHGME: 'invitable' word does not exist
  // OPTIMIZE ? use model functions?
  return allPlayers.filter( (anyPlayer) => {
    return !isTeamMember(anyPlayer, teamMembers);
  });
}

/** Wrapper to find a team member **/
async function findTeamMemberById(team, playerId){
  const teamMembersFound = await team.getPlayers( { where: { id: playerId } } );
  return (teamMembersFound.length == 1) ? teamMembersFound[0] : null;
}

/** Fix new/update parameters passed from form **/
function fixSubmitParams(params){
  /** Parse isCaptain to boolean, html form passes it as 'on' or null **/
  params.isCaptain = Boolean(params.isCaptain);
}


router.get('teamPlayerNew', '/new', async (ctx) => {
  await ctx.render('teamPlayers/new', {
    team: ctx.state.team,
    playersNotInTeam: getInvitablePlayers(ctx.state.players, ctx.state.teamMembers),
    submitTeamPlayerPath: ctx.router.url('teamPlayerCreate', {
      teamId: ctx.state.team.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.post('teamPlayerCreate', '/', async (ctx) => {
  fixSubmitParams(ctx.request.body);
  console.log("CREATING: ", ctx.request.body.isCaptain, ctx.request.body.playerId);
  try {
    await ctx.state.team.addPlayer(ctx.request.body.playerId, {
      through: { isCaptain: ctx.request.body.isCaptain }
    });
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    console.log("###### validation error when creating team-player: ", validationError); // DEBUG
    await ctx.render('teamPlayers/new', {
      team: ctx.state.team,
      errors: validationError.errors,
      playersNotInTeam: getInvitablePlayers(ctx.state.players, ctx.state.teamMembers),
      submitTeamPlayerPath: ctx.router.url('teamPlayerCreate', {
        teamId: ctx.state.team.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.get('teamPlayerEdit', '/:id/edit', async (ctx) => {
  const teamMember = await findTeamMemberById(ctx.state.team, ctx.params.id);
  await ctx.render('teamPlayers/edit', {
    team: ctx.state.team,
    teamMember,
    submitTeamPlayerPath: ctx.router.url('teamPlayerUpdate', {
      teamId: ctx.state.team.id,
      id: teamMember.id
    }),
    deleteTeamPlayerPath: ctx.router.url('teamPlayerDelete', {
      teamId: ctx.state.team.id,
      id: teamMember.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.patch('teamPlayerUpdate', '/:id', async (ctx) => {
  fixSubmitParams(ctx.request.body);
  const teamMember = await findTeamMemberById(ctx.state.team, ctx.params.id);
  console.log("UPDATING: ", ctx.request.body.isCaptain, teamMember);
  try {
    await ctx.state.team.addPlayer(teamMember, {
      through: { isCaptain: ctx.request.body.isCaptain }
    });
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    console.log("###### validation error when updating team-player: ", validationError); // DEBUG
    await ctx.render('teamPlayers/edit', {
      team: ctx.state.team,
      teamMember,
      errors: validationError.errors,
      submitTeamPlayerPath: ctx.router.url('teamPlayerUpdate', {
        teamId: ctx.state.team.id,
        id: teamMember.id
      }),
      deleteTeamPlayerPath: ctx.router.url('teamPlayerDelete', {
        teamId: ctx.state.team.id,
        id: teamMember.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.delete('teamPlayerDelete', '/:id', async (ctx) => {
   await ctx.state.team.removePlayer(ctx.params.id);
   ctx.redirect(ctx.router.url('team', ctx.state.team.id));
 });

module.exports = router;
