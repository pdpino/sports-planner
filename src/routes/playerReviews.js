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

router.post('playerReviewEnable', '/enable', async (ctx) => {
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

      await ctx.state.match.createPlayerReview({
        isPending: true,
        reviewerId: reviewer.userId,
        reviewedId,
      });
    });
  });

  // const schedule = await ctx.state.match.getSchedule();
  // if (schedule){
  //   const field = await ctx.orm.field.findById(schedule.fieldId);
  //   const compound = await ctx.orm.compound.findById(field.compoundId);
  //   const compoundOwner = await ctx.orm.compoundOwner.findById(field.compoundOwnerId);
  // }

  await ctx.state.match.update({
    isDone: true,
  });

  ctx.redirect(ctx.router.url('match', ctx.state.match.id));
});

router.post('playerReviewCreate', '/:playerId', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const reviewedPlayer = await ctx.findById(ctx.orm.player, ctx.params.playerId);
  const pendingReview = await ctx.state.match.getPendingReview(ctx.state.currentUser, reviewedPlayer);
  ctx.assert(pendingReview, 403, 'No hay reviews pendientes');

  ctx.assert(ctx.state.match.isInThePast(), 403, 'El partido aún no ocurre');

  const params = getParams(ctx.request.body);
  await pendingReview.doReview(params);
  ctx.redirect(ctx.router.url('match', ctx.state.match.id));
});

module.exports = router;
