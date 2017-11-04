const KoaRouter = require('koa-router');
const _ = require('lodash');
const notifications = require('../services/notifications');

const router = new KoaRouter();

function getParams(params){
  return {
    isAdmin: Boolean(params.isAdmin),
    status: params.status,
  }
}

router.get('playerMatchNew', '/new', async (ctx) => {
  await ctx.render('playerMatches/new', {
    player: ctx.state.player,
    // invitableMatches: ctx.state.invitableMatches,
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
      // invitableMatches: ctx.state.invitableMatches,
      errors: ctx.parseValidationError(validationError),
      submitPlayerMatchPath: ctx.router.url('playerMatchCreate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.get('playerMatchEdit', '/:id/edit', async (ctx) => {
  const playerMatch = await ctx.state.player.getMatch(ctx.params.id);
  const chooseStatuses = ctx.eligibleStatuses(playerMatch.isPlayerInvited.status, false);

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
  const playerMatch = await ctx.state.player.getMatch(ctx.params.id);
  const matchAdmins = await playerMatch.getAdmins();
  const chooseStatuses = ctx.eligibleStatuses(playerMatch.isPlayerInvited.status, false);

  const params = getParams(ctx.request.body);
  const statusChanged = params.status !== playerMatch.isPlayerInvited.status;

  const isCurrentPlayerAdmin = _.find(matchAdmins, (admin) => {
    admin.id === ctx.state.currentPlayer.id
  });

  if (params.isAdmin && !isCurrentPlayerAdmin){
    params.isAdmin = false;
  }

  try {
    await ctx.state.player.updateMatch(playerMatch, params);

    if(statusChanged && params.status == 'accepted'){ // HACK: status hardcoded
      await notifications.playerAcceptMatch(ctx, ctx.state.currentPlayer, matchAdmins, playerMatch);
    }

    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    await ctx.render('playerMatches/edit', {
      player: ctx.state.player,
      match: playerMatch,
      chooseStatuses,
      errors: ctx.parseValidationError(validationError),
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
