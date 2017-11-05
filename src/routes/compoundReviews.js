const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'rating', 'content');
}

router.post('compoundReviewCreate', '/:matchId', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const match = ctx.findById(ctx.orm.match, ctx.params.matchId);
  const pendingReview = await ctx.state.compound.getPendingReview(ctx.state.currentPlayer, match);
  ctx.assert(pendingReview, 403, 'No hay reviews pendientes');

  ctx.assert(ctx.state.match.isInThePast(), 403, 'El partido aún no ocurre');

  const params = getParams(ctx.request.body);
  await pendingReview.doReview(params);
  ctx.redirect(ctx.router.url('compound', ctx.state.compound.id));
});

module.exports = router;
