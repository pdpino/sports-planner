const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedMatch is in playerMatches **/
function isMatchInvitable(searchedMatch, playerMatches){
  return Boolean(playerMatches.find((match) => match.id == searchedMatch.id));
}

/** Return the difference between allMatches and playerMatches **/
function getMatchesNotInvited(allMatches, playerMatches){
  // OPTIMIZE ???
  return allMatches.filter( (anyMatch) => {
    return !isMatchInvitable(anyMatch, playerMatches);
  });
}

/** Return the match played by player, searching with matchId **/
async function findPlayerMatchById(player, matchId){
  // OPTIMIZE? use a model function?
  const playerMatches = await player.getMatches( { where: { id: matchId } } );
  return (playerMatches.length == 1) ? playerMatches[0] : null;
}

router.get('playerMatchNew', '/new', async (ctx) => {
  await ctx.render('playerMatches/new', {
    player: ctx.state.player,
    matchesNotInvited: getMatchesNotInvited(ctx.state.matches, ctx.state.playerMatches),
    submitPlayerMatchPath: ctx.router.url('playerMatchCreate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.post('playerMatchCreate', '/', async (ctx) => {
  const playMatch = await findPlayerMatchById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addMatch(ctx.request.body.matchId, { through: { status: "sentByUser" }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("###### validation error when creating player-match: ", validationError); // DEBUG
    await ctx.render('playerMatches/new', {
      player: ctx.state.player,
      matchesNotInvited: getMatchesNotInvited(ctx.state.matches, ctx.state.playerMatches),
      errors: validationError.errors,
      submitPlayerMatchPath: ctx.router.url('playerMatchCreate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.get('playerMatchEdit', '/:id/edit', async (ctx) => {
  const playMatch = await findPlayerMatchById(ctx.state.player, ctx.params.id);
  await ctx.render('playerMatches/edit', {
    player: ctx.state.player,
    playMatch,
    submitPlayerMatchPath: ctx.router.url('playerMatchUpdate', { playerId: ctx.state.player.id, id: playMatch.id }),
    deletePlayerMatchPath: ctx.router.url('playerMatchDelete', { playerId: ctx.state.player.id, id: playMatch.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.patch('playerMatchUpdate', '/:id', async (ctx) => {
  const playMatch = await findPlayerMatchById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addMatch(playMatch, { through: { status: ctx.request.body.status }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("###### validation error when updating player-match: ", validationError); // DEBUG
    await ctx.render('playerMatches/edit', {
      player: ctx.state.player,
      playMatch,
      errors: validationError.errors,
      submitPlayerMatchPath: ctx.router.url('playerMatchUpdate', { playerId: ctx.state.player.id, id: playMatch.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.delete('playerMatchDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeMatch(ctx.params.id);
   ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
 });


module.exports = router;
