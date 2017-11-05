const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'rating', 'content');
}

router.post('playerReviewCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const pendingReview = ctx.state.player.getPendingReview(ctx.state.currentUser);
  ctx.assert(pendingReview, 403, 'No hay reviews pendientes');

  const params = getParams(ctx.request.body);

  await ctx.state.player.receiveReview(pendingReview, params);
  ctx.redirect(ctx.router.url('player', ctx.state.player.id));
});

module.exports = router;
