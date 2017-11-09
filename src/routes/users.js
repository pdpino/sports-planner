const KoaRouter = require('koa-router');
const notificationsRouter = require('./notifications');

const router = new KoaRouter();

router.use(
  '/:userId/notifications',
  async (ctx, next) => {
    ctx.state.user = await ctx.findById(ctx.orm.user, ctx.params.userId);

    return next();
  },
  notificationsRouter.routes(),
);

module.exports = router;
