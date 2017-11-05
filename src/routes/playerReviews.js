const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'rating', 'content');
}

router.post('playerReviewCreate', '/:playerId', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const reviewedPlayer = await ctx.findById(ctx.orm.player, ctx.params.playerId);

  const pendingReview = await ctx.state.match.getPendingReview(ctx.state.currentUser, reviewedPlayer);
  ctx.assert(pendingReview, 403, 'No hay reviews pendientes');

  // TODO: match must be in the past

  const params = getParams(ctx.request.body);

  await pendingReview.doReview(params);
  ctx.redirect(ctx.router.url('match', ctx.state.match.id));
});

module.exports = router;
