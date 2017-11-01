const KoaRouter = require('koa-router');
// const pkg = require('../../package.json');

const router = new KoaRouter();

router.get('home', '', async (ctx) => {
  if (ctx.state.isLoggedIn){
    const notifications = await ctx.state.currentUser.getReceivedNotifications({
      order: [
        ['createdAt', 'DESC']
      ]
    });
    // REVIEW: if a different home is needed for player and owner, create new view called home/owner (or compoundOwner)
    await ctx.render('home/player', {
      notifications,
    });
  } else {
    await ctx.render('index', { });
  }
});

module.exports = router;
