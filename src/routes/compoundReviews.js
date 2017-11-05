const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'rating', 'content');
}

router.post('compoundReviewCreate', '/:matchId', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const match = await ctx.findById(ctx.orm.match, ctx.params.matchId);
  const pendingReview = await ctx.state.compound.getPendingReview(ctx.state.currentPlayer, match);
  ctx.assert(pendingReview, 403, 'No hay reviews pendientes');

  ctx.assert(match.isInThePast(), 403, 'El partido aún no ocurre');

  const params = getParams(ctx.request.body);
  try{
    await pendingReview.doReview(params);
  } catch (error){
    // TODO: show it better to the user
    const errorMessage = error.errors[0].message;
    ctx.throw(403, `${errorMessage}`);
  }

  ctx.redirect(ctx.router.url('match', match.id));
});

module.exports = router;
