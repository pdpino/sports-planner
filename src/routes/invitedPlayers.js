const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedMatch is in invitedPlayers **/
function isPlayerInvited(searchedPlayer, invitedPlayers){
  return Boolean(invitedPlayers.find((player) => player.id == searchedPlayer.id));
}

/** Return the difference between allPlayers and invitedPlayers **/
function getInvitablePlayers(allPlayers, invitedPlayers){
  // OPTIMIZE ???
  return allPlayers.filter( (anyPlayer) => {
    return !isPlayerInvited(anyPlayer, invitedPlayers);
  });
}

/** Return the match played by player, searching with matchId **/
async function findInvitedPlayerById(match, playerId){
  // OPTIMIZE? use a model function?
  const invitedPlayers = await match.getPlayers( { where: { id: playerId } } );
  return (invitedPlayers.length == 1) ? invitedPlayers[0] : null;
}

router.get('invitedPlayerNew', '/new', async (ctx) => {
  await ctx.render('invitedPlayers/new', {
    match: ctx.state.match,
    invitablePlayers: getInvitablePlayers(ctx.state.players, ctx.state.invitedPlayers),
    submitInvitedPlayerPath: ctx.router.url('invitedPlayerCreate', {
      matchId: ctx.state.match.id
    }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.post('invitedPlayerCreate', '/', async (ctx) => {
  const invitedPlayer = await findInvitedPlayerById(ctx.state.match, ctx.params.id);
  try {
    await ctx.state.match.addPlayer(ctx.request.body.playerId, {
      through: { status: "sent" }
    });
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedPlayers/new', {
      match: ctx.state.match,
      invitablePlayers: getInvitablePlayers(ctx.state.players, ctx.state.invitedPlayers),
      errors: validationError.errors,
      submitInvitedPlayerPath: ctx.router.url('invitedPlayerCreate', { matchId: ctx.state.match.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.get('invitedPlayerEdit', '/:id/edit', async (ctx) => {
  const invitedPlayer = await findInvitedPlayerById(ctx.state.match, ctx.params.id);
  const chooseStatuses = ctx.state.eligibleStatuses(invitedPlayer.isPlayerInvited.status, false);

  await ctx.render('invitedPlayers/edit', {
    match: ctx.state.match,
    invitedPlayer,
    chooseStatuses,
    submitInvitedPlayerPath: ctx.router.url('invitedPlayerUpdate', {
      matchId: ctx.state.match.id,
      id: invitedPlayer.id
    }),
    deleteInvitedPlayerPath: ctx.router.url('invitedPlayerDelete', {
      matchId: ctx.state.match.id,
      id: invitedPlayer.id
    }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.patch('invitedPlayerUpdate', '/:id', async (ctx) => {
  const invitedPlayer = await findInvitedPlayerById(ctx.state.match, ctx.params.id);
  const newStatus = ctx.request.body.status || invitedPlayer.isPlayerInvited.status;
  const isAdmin = Boolean(ctx.request.body.isAdmin);
  const chooseStatuses = ctx.state.eligibleStatuses(invitedPlayer.isPlayerInvited.status, false);

  try {
    await ctx.state.match.addPlayer(invitedPlayer, { through: {
      status: newStatus,
      isAdmin,
    }});
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedPlayers/edit', {
      match: ctx.state.match,
      invitedPlayer,
      chooseStatuses,
      errors: validationError.errors,
      submitInvitedPlayerPath: ctx.router.url('invitedPlayerUpdate', {
        matchId: ctx.state.match.id,
        id: invitedPlayer.id
      }),
      deleteInvitedPlayerPath: ctx.router.url('invitedPlayerDelete', {
        matchId: ctx.state.match.id,
        id: invitedPlayer.id
      }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
    });
  }
});

router.delete('invitedPlayerDelete', '/:id', async (ctx) => {
   await ctx.state.match.removePlayer(ctx.params.id);
   ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
 });

module.exports = router;
