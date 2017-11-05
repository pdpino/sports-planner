const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Wrapper to get the friend and the friendship status **/
async function getFriendAndStatus(ctx){
  const friend = await ctx.findById(ctx.orm.player, ctx.params.friendId);
  const friendshipStatus = await ctx.state.player.getFriendshipStatus(friend);

  return { friend, friendshipStatus };
}

router.post('friendCreate', '/:friendId', async (ctx) => {
  const { friend, friendshipStatus } = await getFriendAndStatus(ctx);

  ctx.assert(ctx.orm.player.canAddFriend(friendshipStatus), 400, 'No se puede añadir amigo');

  try {
    await ctx.state.player.askFriend(friend);
    ctx.addFriend(ctx.state.player, friend);
    ctx.redirect(ctx.router.url('player', friend.id));
  } catch (validationError) {
    const error = ctx.parseValidationError(validationError);
    ctx.throw(400, `No se pudo agregar amigo: ${error}`);
  }
});

router.patch('friendAccept', '/:friendId', async (ctx) => {
  const { friend, friendshipStatus } = await getFriendAndStatus(ctx);
  ctx.assert(ctx.orm.player.canAcceptFriend(friendshipStatus), 400, 'No se puede aceptar amigo');

  try {
    ctx.state.player.acceptFriend(friend);
    ctx.acceptFriend(ctx.state.player, friend);
    ctx.readAskedFriendNotification(friend, ctx.state.player);
    ctx.redirect(ctx.router.url('player', friend.id));
  } catch (validationError) {
    const error = ctx.parseValidationError(validationError);
    ctx.throw(400, `No se pudo aceptar amigo: ${error}`);
  }
});

router.delete('friendDelete', '/:friendId', async (ctx) => {
  const { friend, friendshipStatus } = await getFriendAndStatus(ctx);
  ctx.assert(ctx.orm.player.canDeleteFriend(friendshipStatus), 400, 'No se puede eliminar amigo');

  // OPTIMIZE: avoid 2 queries (2 queries ensure to delete the relation)
  await ctx.state.player.removeFriend(friend);
  await friend.removeFriend(ctx.state.player);

  ctx.redirect(ctx.router.url('player', friend.id));
});

module.exports = router;
