const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedTeam is in playTeams **/
function teamismember(searchedPlayer, memberOfTeams){
  return Boolean(memberOfTeams.find((player) => player.id == searchedPlayer.id));
}

/** Return the difference between allTeams and playTeams **/
function getTeamsNotMember(allTeams, memberOfTeams){
  // OPTIMIZE ???
  return allTeams.filter( (anyTeam) => {
    return !teamismember(anyTeam, memberOfTeams);
  });
}

/** Return the team played by team, searching with teamId **/
async function findTeamPlayerById(team, teamId){
  const memberOfTeams = await team.getPlayers( { where: { id: teamId } } );
  return (memberOfTeams.length == 1) ? memberOfTeams[0] : null;
}

router.get('teamPlayerNew', '/new', async (ctx) => {
  await ctx.render('teamPlayers/new', {
    team: ctx.state.team,
    teamsNotPlayed: getTeamsNotMember(ctx.state.players, ctx.state.memberOfTeams),
    submitTeamPlayerPath: ctx.router.url('teamPlayerCreate', {
      teamId: ctx.state.team.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.post('teamPlayerCreate', '/', async (ctx) => {
  try {
    await ctx.state.team.addPlayer(ctx.request.body.playerId, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    console.log("###### validation error when creating team-team: ", validationError); // DEBUG
    await ctx.render('teamPlayers/new', {
      team: ctx.state.team,
      teamsNotPlayed: getTeamsNotMember(ctx.state.teams, ctx.state.memberOfTeams),
      errors: validationError.errors,
      submitTeamPlayerPath: ctx.router.url('teamPlayerCreate', {
        teamId: ctx.state.team.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.get('teamPlayerEdit', '/:id/edit', async (ctx) => {
  const memberOfTeam = await findTeamPlayerById(ctx.state.team, ctx.params.id);
  await ctx.render('teamPlayers/edit', {
    team: ctx.state.team,
    memberOfTeam,
    submitTeamPlayerPath: ctx.router.url('teamPlayerUpdate', {
      teamId: ctx.state.team.id,
      id: memberOfTeam.id
    }),
    deleteTeamPlayerPath: ctx.router.url('teamPlayerDelete', {
      teamId: ctx.state.team.id,
      id: memberOfTeam.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.patch('teamPlayerUpdate', '/:id', async (ctx) => {
  const memberOfTeam = await findTeamPlayerById(ctx.state.team, ctx.params.id);
  try {
    await ctx.state.team.addTeam(memberOfTeam, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    console.log("###### validation error when updating team-team: ", validationError); // DEBUG
    await ctx.render('teamPlayers/edit', {
      team: ctx.state.team,
      memberOfTeam,
      errors: validationError.errors,
      submitTeamPlayerPath: ctx.router.url('teamPlayerUpdate', {
        teamId: ctx.state.team.id,
        id: memberOfTeam.id
      }),
      deleteTeamPlayerPath: ctx.router.url('teamPlayerDelete', {
        teamId: ctx.state.team.id,
        id: memberOfTeam.id
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
