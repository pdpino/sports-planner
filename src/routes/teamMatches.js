const KoaRouter = require('koa-router');


const router = new KoaRouter();

router.get('teamMatchNew', '/new', async (ctx) => {
  await ctx.render('teamMatches/new', {
    team: ctx.state.team,
    // joinableMatches: ctx.state.joinableMatches,
    submitTeamMatchPath: ctx.router.url('teamMatchCreate', {
      teamId: ctx.state.team.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.post('teamMatchCreate', '/', async (ctx) => {
  try {
    await ctx.state.team.askForMatch(ctx.request.body.matchId);
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    await ctx.render('teamMatches/new', {
      team: ctx.state.team,
      errors: ctx.parseValidationError(validationError),
      // joinableMatches: ctx.state.joinableMatches,
      submitTeamMatchPath: ctx.router.url('teamMatchCreate', {
        teamId: ctx.state.team.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.get('teamMatchEdit', '/:id/edit', async (ctx) => {
  const teamMatch = await ctx.state.team.getMatch(ctx.params.id);
  ctx.assert(teamMatch, 404);

  await ctx.render('teamMatches/edit', {
    team: ctx.state.team,
    teamMatch,
    chooseStatuses: ctx.eligibleStatuses(teamMatch.isTeamInvited.status, false),
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
  const teamMatch = await ctx.state.team.getMatch(ctx.params.id);
  ctx.assert(teamMatch, 404);

  const matchAdmins = await teamMatch.getAdmins();
  const newStatus = ctx.request.body.status || teamMatch.isTeamInvited.status;
  const statusChanged = newStatus !== teamMatch.isTeamInvited.status;

  try {
    await ctx.state.team.addMatch(teamMatch, {
      through: {
        status: newStatus
      }
    });

    if(statusChanged && newStatus == 'accepted'){ // HACK: status hardcoded
      // Invite all of his players to the game
      await teamMatch.invitePlayers(ctx.state.teamMembers);
      await ctx.teamAcceptMatch(ctx.state.currentPlayer, matchAdmins, ctx.state.team, teamMatch);
    }

    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    await ctx.render('teamMatches/edit', {
      team: ctx.state.team,
      teamMatch,
      chooseStatuses: ctx.eligibleStatuses(teamMatch.isTeamInvited.status, false),
      errors: ctx.parseValidationError(validationError),
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
