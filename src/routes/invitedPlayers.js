const _ = require('lodash');
const notifications = require('../services/notifications');
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

/** Return the match played by player, searching with matchId */
async function findInvitedPlayerById(match, playerId) {
  const invitedPlayers = await match.getPlayers({ where: { id: playerId } });
  return (invitedPlayers.length === 1) ? invitedPlayers[0] : null;
}

function getParams(params){
  const filteredParams = _.pick(params, 'isAdmin', 'status');
  filteredParams.isAdmin = Boolean(filteredParams.isAdmin);
  return filteredParams;
}

router.get('invitedPlayerNew', '/new', async (ctx) => {
  await ctx.render('invitedPlayers/new', {
    match: ctx.state.match,
    invitablePlayers: getInvitablePlayers(ctx.state.invitablePlayers, ctx.state.invitedPlayers),
    submitInvitedPlayerPath: ctx.router.url('invitedPlayerCreate', {
      matchId: ctx.state.match.id
    }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.post('invitedPlayerCreate', '/', async (ctx) => {
  const player = await ctx.state.findById(ctx.orm.player, ctx.request.body.playerId);
  try {
    await ctx.state.match.invitePlayer(player);
    await notifications.invitePlayerToMatch(ctx, ctx.state.currentPlayer, player, ctx.state.match);
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedPlayers/new', {
      match: ctx.state.match,
      invitablePlayers: getInvitablePlayers(ctx.state.invitablePlayers, ctx.state.invitedPlayers),
      errors: ctx.state.parseValidationError(validationError),
      submitInvitedPlayerPath: ctx.router.url('invitedPlayerCreate', { matchId: ctx.state.match.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id }),
    });
  }
});

router.get('invitedPlayerEdit', '/:id/edit', async (ctx) => {
  const invitedPlayer = await findInvitedPlayerById(ctx.state.match, ctx.params.id);
  const chooseStatuses = ctx.state.eligibleStatuses(invitedPlayer.isPlayerInvited.status, true);

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
  const chooseStatuses = ctx.state.eligibleStatuses(invitedPlayer.isPlayerInvited.status, true);
  const params = getParams(ctx.request.body);

  try {
    await ctx.state.match.updatePlayerInvitation(invitedPlayer, params.status, params.isAdmin);
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedPlayers/edit', {
      match: ctx.state.match,
      invitedPlayer,
      chooseStatuses,
      errors: ctx.state.parseValidationError(validationError),
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
