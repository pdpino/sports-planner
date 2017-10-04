const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Check if a match is the list of matches of the team **/
function isTeamInvited(searchedMatch, teamMatches){
  return Boolean(teamMatches.find((match) => match.id == searchedMatch.id));
}

/** Return the difference between allMatches and the matches of the team **/
function getJoinableMatches(allMatches, teamMatches){
  // OPTIMIZE ?
  return allMatches.filter( (match) => {
    return !isTeamInvited(match, teamMatches);
  });
}

/** Wrapper to find a specific team match **/
async function findTeamMatchById(team, matchId){
  const teamMatchesFound = await team.getMatches( { where: { id: matchId } } );
  return (teamMatchesFound.length == 1) ? teamMatchesFound[0] : null;
}

router.get('teamMatchNew', '/new', async (ctx) => {
  await ctx.render('teamMatches/new', {
    team: ctx.state.team,
    joinableMatches: getJoinableMatches(ctx.state.allMatches, ctx.state.teamMatches),
    submitTeamMatchPath: ctx.router.url('teamMatchCreate', {
      teamId: ctx.state.team.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.post('teamMatchCreate', '/', async (ctx) => {
  try {
    await ctx.state.team.addMatch(ctx.request.body.matchId, {
      through: { status: "sentByTeam" }
    });
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    console.log("###### validation error when creating team-match: ", validationError); // DEBUG
    await ctx.render('teamMatches/new', {
      team: ctx.state.team,
      errors: validationError.errors,
      joinableMatches: getJoinableMatches(ctx.state.allMatches, ctx.state.teamMatches),
      submitTeamMatchPath: ctx.router.url('teamMatchCreate', {
        teamId: ctx.state.team.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.get('teamMatchEdit', '/:id/edit', async (ctx) => {
  const teamMatch = await findTeamMatchById(ctx.state.team, ctx.params.id);

  await ctx.render('teamMatches/edit', {
    team: ctx.state.team,
    teamMatch,
    submitTeamMatchPath: ctx.router.url('teamMatchUpdate', {
      teamId: ctx.state.team.id,
      id: teamMatch.id
    }),
    deleteTeamMatchPath: ctx.router.url('teamMatchDelete', {
      teamId: ctx.state.team.id,
      id: teamMatch.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.patch('teamMatchUpdate', '/:id', async (ctx) => {
  const teamMatch = await findTeamMatchById(ctx.state.team, ctx.params.id);

  const newStatus = ctx.request.body.status || teamMatch.isTeamInvited.status;
  const statusChanged = newStatus !== teamMatch.isTeamInvited.status;

  try {
    await ctx.state.team.addMatch(teamMatch, {
      through: { status: newStatus }
    });

    if(statusChanged && newStatus == "accepted"){ // HACK: status hardcoded
      // Invite all of his players to the game
      await teamMatch.addPlayers(ctx.state.teamMembers, {
        through: { status: "sentToUser" }
      });
      // HACK: status hardcoded
    }

    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    console.log("###### validation error when updating team-match: ", validationError); // DEBUG
    await ctx.render('teamMatches/edit', {
      team: ctx.state.team,
      teamMatch,
      errors: validationError.errors,
      submitTeamMatchPath: ctx.router.url('teamMatchUpdate', {
        teamId: ctx.state.team.id,
        id: teamMatch.id
      }),
      deleteTeamMatchPath: ctx.router.url('teamMatchDelete', {
        teamId: ctx.state.team.id,
        id: teamMatch.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.delete('teamMatchDelete', '/:id', async (ctx) => {
   await ctx.state.team.removeMatch(ctx.params.id);
   ctx.redirect(ctx.router.url('team', ctx.state.team.id));
 });

module.exports = router;
