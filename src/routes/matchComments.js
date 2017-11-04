const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'content');
}

router.post('matchCommentCreate', '/', async (ctx) => {
  const hasCommentPermission = await ctx.state.match.isPlayerInvited(ctx.state.currentPlayer);
  ctx.assert(hasCommentPermission, 403);

  const params = getParams(ctx.request.body);
  await ctx.state.match.makeComment(ctx.state.currentPlayer, params);
  ctx.redirect(ctx.router.url('match', ctx.state.match.id));
});

router.delete('matchCommentDelete', '/:id', async (ctx) => {
  const comment = await ctx.findById(ctx.orm.matchComment, ctx.params.id);
  ctx.requireModifyPermission(comment.player.userId);

  await comment.destroy();
  ctx.redirect(ctx.router.url('match', ctx.state.match.id));
});

module.exports = router;
