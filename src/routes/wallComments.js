const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'content');
}

router.post('wallCommentCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  // REFACTOR
  const friendshipStatus = (ctx.state.isPlayerLoggedIn
    && await ctx.state.currentPlayer.getFriendshipStatus(ctx.state.player));

  ctx.assert(ctx.orm.player.hasCommentPermission(friendshipStatus), 403);

  const params = getParams(ctx.request.body);

  await ctx.state.player.receiveWallComment(ctx.state.currentPlayer, params);
  ctx.redirect(ctx.router.url('player', ctx.state.player.id));
});

router.delete('wallCommentDelete', '/:id', async (ctx) => {
  const comment = await ctx.findById(ctx.orm.wallComment, ctx.params.id);

  ctx.requireModifyPermission(comment.commenter.userId);

  await comment.destroy();
  ctx.redirect(ctx.router.url('player', ctx.state.player.id));
});

module.exports = router;
