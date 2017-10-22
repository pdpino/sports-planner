const KoaRouter = require('koa-router');
// const pkg = require('../../package.json');

const router = new KoaRouter();

router.get('home', '', async (ctx) => {
  if (ctx.state.isPlayerLoggedIn){
    const notifications = await ctx.state.currentPlayer.getPlayerNotifications();
    await ctx.render('home/player', {
      notifications,
    });
  } else {
    await ctx.render('index', { });
  }
});

module.exports = router;
