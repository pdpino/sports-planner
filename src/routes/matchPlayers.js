const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedMatch is in matchPlayers **/
function isPlayerInvited(searchedPlayer, matchPlayers){
  return Boolean(matchPlayers.find((player) => player.id == searchedPlayer.id));
}

/** Return the difference between allMatches and matchPlayers **/
function getPlayersNotInvited(allPlayers, matchPlayers){
  // OPTIMIZE ???
  return allPlayers.filter( (anyPlayer) => {
    return !isPlayerInvited(anyPlayer, matchPlayers);
  });
}

/** Return the match played by player, searching with matchId **/
async function findMatchPlayerById(match, playerId){
  // OPTIMIZE? use a model function?
  const matchPlayers = await match.getPlayers( { where: { id: playerId } } );
  return (matchPlayers.length == 1) ? matchPlayers[0] : null;
}

router.get('matchPlayerNew', '/new', async (ctx) => {
  await ctx.render('matchPlayers/new', {
    match: ctx.state.match,
    playersNotInvited: getPlayersNotInvited(ctx.state.players, ctx.state.matchPlayers),
    submitMatchPlayerPath: ctx.router.url('matchPlayerCreate', { matchId: ctx.state.match.id }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.post('matchPlayerCreate', '/', async (ctx) => {
  const playMatch = await findMatchPlayerById(ctx.state.match, ctx.params.id);
  try {
    await ctx.state.match.addPlayer(ctx.request.body.playerId, { through: { status: "sentToUser" }});
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    console.log("###### validation error when creating player-match: ", validationError); // DEBUG
    await ctx.render('matchPlayers/new', {
      match: ctx.state.match,
      playersNotInvited: getPlayersNotInvited(ctx.state.players, ctx.state.matchPlayers),
      errors: validationError.errors,
      submitMatchPlayerPath: ctx.router.url('matchPlayerCreate', { matchId: ctx.state.match.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.get('matchPlayerEdit', '/:id/edit', async (ctx) => {
  const playMatch = await findMatchPlayerById(ctx.state.match, ctx.params.id);
  await ctx.render('matchPlayers/edit', {
    match: ctx.state.match,
    playMatch,
    submitMatchPlayerPath: ctx.router.url('matchPlayerUpdate', { matchId: ctx.state.match.id, id: playMatch.id }),
    deleteMatchPlayerPath: ctx.router.url('matchPlayerDelete', { matchId: ctx.state.match.id, id: playMatch.id }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.patch('matchPlayerUpdate', '/:id', async (ctx) => {
  const playMatch = await findMatchPlayerById(ctx.state.match, ctx.params.id);
  try {
    await ctx.state.match.addPlayer(playMatch, { through: { status: ctx.request.body.status }});
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    console.log("###### validation error when updating player-match: ", validationError); // DEBUG
    await ctx.render('matchPlayers/edit', {
      match: ctx.state.match,
      playMatch,
      errors: validationError.errors,
      submitMatchPlayerPath: ctx.router.url('matchPlayerUpdate', { matchId: ctx.state.match.id, id: playMatch.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.delete('matchPlayerDelete', '/:id', async (ctx) => {
   await ctx.state.match.removePlayer(ctx.params.id);
   ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
 });


module.exports = router;
