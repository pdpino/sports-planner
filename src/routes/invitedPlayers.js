const KoaRouter = require('koa-router');
const _ = require('lodash');


const router = new KoaRouter();

function getParams(params){
  const filteredParams = _.pick(params, 'isAdmin', 'status');
  filteredParams.isAdmin = Boolean(filteredParams.isAdmin);
  return filteredParams;
}

router.get('invitedPlayerNew', '/new', async (ctx) => {
  ctx.requireMatchNotDone(ctx.state.match);
  await ctx.render('invitedPlayers/new', {
    match: ctx.state.match,
    // invitablePlayers: ctx.state.invitablePlayers,
    submitInvitedPlayerPath: ctx.router.url('invitedPlayerCreate', {
      matchId: ctx.state.match.id
    }),
    cancelPath: ctx.router.url('match', { id: ctx.state.match.id })
  });
});

router.post('invitedPlayerCreate', '/', async (ctx) => {
  ctx.requireMatchNotDone(ctx.state.match);
  const player = await ctx.findById(ctx.orm.player, ctx.request.body.playerId);
  try {
    await ctx.state.match.invitePlayer(player);
    await ctx.invitePlayerToMatch(ctx.state.currentPlayer, player, ctx.state.match);
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedPlayers/new', {
      match: ctx.state.match,
      // invitablePlayers: ctx.state.invitablePlayers,
      errors: ctx.parseValidationError(validationError),
      submitInvitedPlayerPath: ctx.router.url('invitedPlayerCreate', { matchId: ctx.state.match.id }),
      cancelPath: ctx.router.url('match', { id: ctx.state.match.id }),
    });
  }
});

router.get('invitedPlayerEdit', '/:id/edit', async (ctx) => {
  ctx.requireMatchNotDone(ctx.state.match);
  const invitedPlayer = await ctx.state.match.getPlayer(ctx.params.id);
  const chooseStatuses = ctx.eligibleStatuses(invitedPlayer.isPlayerInvited.status, true);

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
  ctx.requireMatchNotDone(ctx.state.match);
  const invitedPlayer = await ctx.state.match.getPlayer(ctx.params.id);

  const chooseStatuses = ctx.eligibleStatuses(invitedPlayer.isPlayerInvited.status, true);
  const params = getParams(ctx.request.body);

  try {
    await ctx.state.match.updatePlayerInvitation(invitedPlayer, params.status, params.isAdmin);
    ctx.redirect(ctx.router.url('match', { id: ctx.state.match.id }));
  } catch (validationError) {
    await ctx.render('invitedPlayers/edit', {
      match: ctx.state.match,
      invitedPlayer,
      chooseStatuses,
      errors: ctx.parseValidationError(validationError),
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
