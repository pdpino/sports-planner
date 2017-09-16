const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedTeam is in playTeams **/
function playerismember(searchedTeam, memberOfTeams){
  return Boolean(memberOfTeams.find((team) => team.id == searchedTeam.id));
}

/** Return the difference between allTeams and playTeams **/
function getTeamsNotMember(allTeams, memberOfTeams){
  // OPTIMIZE ???
  return allTeams.filter( (anyTeam) => {
    return !playerismember(anyTeam, memberOfTeams);
  });
}

/** Return the team played by player, searching with teamId **/
async function findPlayerTeamById(player, teamId){
  const memberOfTeams = await player.getTeams( { where: { id: teamId } } );
  return (memberOfTeams.length == 1) ? memberOfTeams[0] : null;
}

router.get('playerTeamNew', '/new', async (ctx) => {
  await ctx.render('playerTeams/new', {
    player: ctx.state.player,
    teamsNotPlayed: getTeamsNotMember(ctx.state.teams, ctx.state.memberOfTeams),
    submitPlayerTeamPath: ctx.router.url('playerTeamCreate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('player', ctx.state.player.id)
  });
});

router.post('playerTeamCreate', '/', async (ctx) => {
  try {
    await ctx.state.player.addTeam(ctx.request.body.teamId, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("###### validation error when creating player-team: ", validationError); // DEBUG
    await ctx.render('playerTeams/new', {
      player: ctx.state.player,
      teamsNotPlayed: getTeamsNotMember(ctx.state.teams, ctx.state.memberOfTeams),
      errors: validationError.errors,
      submitPlayerTeamPath: ctx.router.url('playerTeamCreate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('player', ctx.state.player.id)
    });
  }
});

router.get('playerTeamEdit', '/:id/edit', async (ctx) => {
  const memberOfTeam = await findPlayerTeamById(ctx.state.player, ctx.params.id);
  await ctx.render('playerTeams/edit', {
    player: ctx.state.player,
    memberOfTeam,
    submitPlayerTeamPath: ctx.router.url('playerTeamUpdate', {
      playerId: ctx.state.player.id,
      id: memberOfTeam.id
    }),
    deletePlayerTeamPath: ctx.router.url('playerTeamDelete', {
      playerId: ctx.state.player.id,
      id: memberOfTeam.id
    }),
    cancelPath: ctx.router.url('player', ctx.state.player.id)
  });
});

router.patch('playerTeamUpdate', '/:id', async (ctx) => {
  const memberOfTeam = await findPlayerTeamById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addTeam(memberOfTeam, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("###### validation error when updating player-team: ", validationError); // DEBUG
    await ctx.render('playerTeams/edit', {
      player: ctx.state.player,
      memberOfTeam,
      errors: validationError.errors,
      submitPlayerTeamPath: ctx.router.url('playerTeamUpdate', { playerId: ctx.state.player.id, id: memberOfTeam.id }),
      cancelPath: ctx.router.url('player', ctx.state.player.id)
    });
  }
});

router.delete('playerTeamDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeTeam(ctx.params.id);
   ctx.redirect(ctx.router.url('player', ctx.state.player.id));
 });


module.exports = router;
