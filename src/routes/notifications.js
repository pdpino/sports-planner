const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('notifications', '/', async (ctx, next) => {
  ctx.requireUser(ctx.state.user);

  const notifications = await ctx.state.user.getReceivedNotifications();

  const compactNotifications = notifications.map((notification) => {
    return {
      message: notification.toString(),
      buttons: ctx.getNotificationButtons(notification),
    };
  });

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      await ctx.render('notifications/index', {
        notifications,
        getNotificationButtons: ctx.getNotificationButtons.bind(ctx),
      });
      break;
    case 'json':
      ctx.body = { notifications: compactNotifications };
      break;
    default:
  }
});

module.exports = router;
