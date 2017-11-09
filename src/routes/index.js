const KoaRouter = require('koa-router');
// const pkg = require('../../package.json');

const router = new KoaRouter();

router.get('home', '', async (ctx) => {
  if (ctx.state.isLoggedIn){
    const notifications = await ctx.state.currentUser.getReceivedNotifications();
    // REVIEW: if a different home is needed for player and owner, create a new view called home/owner (or compoundOwner)
    await ctx.render('home/player', {
      notifications,
      getNotificationButtons: ctx.getNotificationButtons.bind(ctx),
    });
  } else {
    await ctx.render('index', { });
  }
});

module.exports = router;
