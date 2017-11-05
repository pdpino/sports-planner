const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'rating', 'content');
}

/**
 * Wrapper to use an async forEach
 * source: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

router.post('reviewsEnable', '/enable', async (ctx) => {
  const canEnableReviews = await ctx.state.match.canEnableReviews({
    player: ctx.state.currentPlayer
  });
  ctx.assert(canEnableReviews, 403);

  const invitedPlayers = await ctx.state.match.getPlayers();
  const invitedPlayerIds = _.map(invitedPlayers, 'id');

  asyncForEach(invitedPlayers, async (reviewer) => {
    asyncForEach(invitedPlayerIds, async (reviewedId) => {
      if (reviewer.id === reviewedId){
        return;
      }

      await ctx.state.match.createPendingPlayerReview(reviewer, reviewedId);
    });
  });

  const schedule = await ctx.state.match.getSchedule();
  try{
    if (schedule){
      const field = await schedule.getField();
      const compound = await field.getCompound();
      const compoundOwner = await compound.getCompoundOwner();

      // Owner can review players
      asyncForEach(invitedPlayerIds, async (reviewedId) => {
        await ctx.state.match.createPendingPlayerReview(compoundOwner, reviewedId);
      });

      // Players can review compound
      asyncForEach(invitedPlayers, async (player) => {
        await ctx.state.match.createPendingCompoundReview(player, compound);
      });
    }
  } catch(error){
    // couldn't find something, pass
  }

  await ctx.state.match.markAsDone();

  ctx.redirect(ctx.router.url('match', ctx.state.match.id));
});

router.post('playerReviewCreate', '/:playerId', async (ctx) => {
  ctx.requireLoggedIn();

  const reviewedPlayer = await ctx.findById(ctx.orm.player, ctx.params.playerId);
  const pendingReview = await ctx.state.match.getPendingReview(ctx.state.currentUser, reviewedPlayer);
  ctx.assert(pendingReview, 403, 'No hay reviews pendientes');

  ctx.assert(ctx.state.match.isInThePast(), 403, 'El partido aún no ocurre');

  const params = getParams(ctx.request.body);
  try{
    await pendingReview.doReview(params);
  } catch (error){
    // TODO: show it better to the user
    const errorMessage = error.errors[0].message;
    ctx.throw(403, `${errorMessage}`);
  }
  ctx.redirect(ctx.router.url('match', ctx.state.match.id));
});

module.exports = router;
