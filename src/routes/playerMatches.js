const notifications = require('../services/notifications');
const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedMatch is in playerMatches **/
function isMatchInvitable(searchedMatch, playerMatches){
  return Boolean(playerMatches.find((match) => match.id == searchedMatch.id));
}

/** Return the difference between allMatches and playerMatches **/
function getInvitableMatches(allMatches, playerMatches){
  // OPTIMIZE ???
  return allMatches.filter( (anyMatch) => {
    return !isMatchInvitable(anyMatch, playerMatches);
  });
}

/** Return the match played by player, searching with matchId **/
async function findPlayerMatchById(player, matchId){
  const playerMatches = await player.getMatches( { where: { id: matchId } } );
  return (playerMatches.length == 1) ? playerMatches[0] : null;
}

router.get('playerMatchNew', '/new', async (ctx) => {
  await ctx.render('playerMatches/new', {
    player: ctx.state.player,
    invitableMatches: getInvitableMatches(ctx.state.visibleMatches, ctx.state.playerMatches),
    submitPlayerMatchPath: ctx.router.url('playerMatchCreate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.post('playerMatchCreate', '/', async (ctx) => {
  try {
    await ctx.state.player.askForMatch(ctx.request.body.matchId);
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    await ctx.render('playerMatches/new', {
      player: ctx.state.player,
      invitableMatches: getInvitableMatches(ctx.state.visibleMatches, ctx.state.playerMatches),
      errors: ctx.state.parseValidationError(validationError),
      submitPlayerMatchPath: ctx.router.url('playerMatchCreate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.get('playerMatchEdit', '/:id/edit', async (ctx) => {
  const playerMatch = await findPlayerMatchById(ctx.state.player, ctx.params.id);
  const chooseStatuses = ctx.state.eligibleStatuses(playerMatch.isPlayerInvited.status, false);

  await ctx.render('playerMatches/edit', {
    player: ctx.state.player,
    match: playerMatch,
    chooseStatuses,
    submitPlayerMatchPath: ctx.router.url('playerMatchUpdate', {
      playerId: ctx.state.player.id,
      id: playerMatch.id
    }),
    deletePlayerMatchPath: ctx.router.url('playerMatchDelete', {
      playerId: ctx.state.player.id,
      id: playerMatch.id
    }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.patch('playerMatchUpdate', '/:id', async (ctx) => {
  const playerMatch = await findPlayerMatchById(ctx.state.player, ctx.params.id);
  const matchAdmin = await playerMatch.getAdmins();
  const chooseStatuses = ctx.state.eligibleStatuses(playerMatch.isPlayerInvited.status, false);

  // TODO: parse values from params

  const newStatus = ctx.request.body.status || playerMatch.isPlayerInvited.status;
  const statusChanged = newStatus !== playerMatch.isPlayerInvited.status;

  const isAdmin = Boolean(ctx.request.body.isAdmin);
  if (isAdmin){
    // FIXME: check that the user has permission to modify this, it could be requested with curl
    // ctx.state.requireAdminMatchPermission();
  }

  try {
    await ctx.state.player.addMatch(playerMatch, {
      through: {
        status: newStatus,
        isAdmin,
      }
    });

    if(statusChanged && newStatus == 'accepted'){ // HACK: status hardcoded
      await notifications.playerAcceptMatch(ctx, ctx.state.currentPlayer, matchAdmins, playerMatch);
    }

    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    await ctx.render('playerMatches/edit', {
      player: ctx.state.player,
      match: playerMatch,
      chooseStatuses,
      errors: ctx.state.parseValidationError(validationError),
      submitPlayerMatchPath: ctx.router.url('playerMatchUpdate', {
        playerId: ctx.state.player.id,
        id: playerMatch.id
      }),
      deletePlayerMatchPath: ctx.router.url('playerMatchDelete', { playerId: ctx.state.player.id,
        id: playerMatch.id
      }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.delete('playerMatchDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeMatch(ctx.params.id);
   ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
 });

module.exports = router;
