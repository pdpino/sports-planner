const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Wrapper to get the friend and the friendship status **/
async function getFriendAndStatus(ctx){
  const friend = await ctx.state.findById(ctx.orm.player, ctx.params.friendId);
  const friendshipStatus = await ctx.state.player.getFriendshipStatus(friend);

  return { friend, friendshipStatus };
}

router.post('friendNew', '/:friendId', async (ctx) => {
  const { friend, friendshipStatus } = await getFriendAndStatus(ctx);

  ctx.assert(ctx.orm.player.canAddFriend(friendshipStatus), 400, 'No se puede añadir amigo');

  try {
    await ctx.state.player.addFriend(friend, {
      through: {
        isAccepted: false,
      }
    });
    ctx.redirect(ctx.router.url('player', { id: friend.id }));
  } catch (validationError) {
    const error = ctx.state.parseValidationError(validationError);
    ctx.throw(400, `No se pudo agregar amigo: ${error}`);
  }
});

router.patch('friendAccept', '/:friendId', async (ctx) => {
  const { friend, friendshipStatus } = await getFriendAndStatus(ctx);
  ctx.assert(ctx.orm.player.canAcceptFriend(friendshipStatus), 400, 'No se puede aceptar amigo');

  try {
    // REVIEW: a bit of a hack,
    // the friends accepts the player because the friend added the player
    await friend.addFriend(ctx.state.player, {
      through: {
        isAccepted: true,
      }
    });
    ctx.redirect(ctx.router.url('player', { id: friend.id }));
  } catch (validationError) {
    const error = ctx.state.parseValidationError(validationError);
    ctx.throw(400, `No se pudo aceptar amigo: ${error}`);
  }
});

router.delete('friendDelete', '/:friendId', async (ctx) => {
  const { friend, friendshipStatus } = await getFriendAndStatus(ctx);
  ctx.assert(ctx.orm.player.canDeleteFriend(friendshipStatus), 400, 'No se puede eliminar amigo');

  // OPTIMIZE: avoid 2 queries
  await ctx.state.player.removeFriend(friend);
  await friend.removeFriend(ctx.state.player);
  
  ctx.redirect(ctx.router.url('player', friend.id));
});

module.exports = router;
