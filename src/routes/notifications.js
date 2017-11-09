const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('notifications', '/', async (ctx, next) => {
  // ctx.requireUserModifyPermission(ctx.state.user);

  const notifications = await ctx.state.user.getReceivedNotifications();

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      await ctx.render('notifications/index', {
        notifications,
        getNotificationButtons: ctx.getNotificationButtons.bind(ctx),
      });
      break;
    case 'json':
      ctx.body = { notifications };
      break;
    default:
  }
});

module.exports = router;
