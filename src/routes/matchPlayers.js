const KoaRouter = require('koa-router');
const matchPlayersRouter = require('./matchPlayers');

const router = new KoaRouter();

/** Boolean if searchedMatch is in matchPlayeres **/
function isPlayerInvited(searchedMatch, matchPlayeres){
  return Boolean(matchPlayeres.find((match) => match.id == searchedMatch.id));
}

/** Return the difference between allMatches and matchPlayeres **/
function getMatchNotInvited(allMatches, matchPlayeres){
  // OPTIMIZE ???
  return allMatches.filter( (anyMatch) => {
    return !doesPlayerPlay(anyMatch, matchPlayeres);
  });
}

/** Return the match played by player, searching with matchId **/
async function findMatchPlayerById(player, matchId){
  // OPTIMIZE? use a model function?
  const matchPlayeres = await player.getMatches( { where: { id: matchId } } );
  return (matchPlayeres.length == 1) ? matchPlayeres[0] : null;
}

router.get('matchPlayerNew', '/new', async (ctx) => {
  await ctx.render('matchPlayeres/new', {
    player: ctx.state.player,
    matchesNotInvited: getMatchNotInvited(ctx.state.matches, ctx.state.matchPlayeres),
    submitMatchPlayerPath: ctx.router.url('matchPlayerCreate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.post('matchPlayerCreate', '/', async (ctx) => {
  const playMatch = await findMatchPlayerById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addMatch(ctx.request.body.matchId, { through: { status: "sentToUser" }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("###### validation error when creating player-match: ", validationError); // DEBUG
    await ctx.render('matchPlayeres/new', {
      player: ctx.state.player,
      matchesNotPlayed: getMatchesNotPlayed(ctx.state.matches, ctx.state.matchPlayeres),
      errors: validationError.errors,
      submitMatchPlayerPath: ctx.router.url('matchPlayerCreate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.get('matchPlayerEdit', '/:id/edit', async (ctx) => {
  const playMatch = await findMatchPlayerById(ctx.state.player, ctx.params.id);
  await ctx.render('matchPlayeres/edit', {
    player: ctx.state.player,
    playMatch,
    submitMatchPlayerPath: ctx.router.url('matchPlayerUpdate', { playerId: ctx.state.player.id, id: playMatch.id }),
    deleteMatchPlayerPath: ctx.router.url('matchPlayerDelete', { playerId: ctx.state.player.id, id: playMatch.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.patch('matchPlayerUpdate', '/:id', async (ctx) => {
  const playMatch = await findMatchPlayerById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addMatch(playMatch, { through: { status: ctx.request.body.status }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("###### validation error when updating player-match: ", validationError); // DEBUG
    await ctx.render('matchPlayeres/edit', {
      player: ctx.state.player,
      playMatch,
      errors: validationError.errors,
      submitMatchPlayerPath: ctx.router.url('matchPlayerUpdate', { playerId: ctx.state.player.id, id: playMatch.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.delete('matchPlayerDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeMatch(ctx.params.id);
   ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
 });


module.exports = router;
