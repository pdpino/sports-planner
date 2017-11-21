const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const authRoutes = require('./auth');
const playersRoutes = require('./players');
const teamsRoutes = require('./teams');
const matchesRoutes = require('./matches');
const sportsRoutes = require('./sports');

const router = new KoaRouter();

// unauthenticated endpoints
router.use('/auth', authRoutes.routes());

// JWT authentication without passthrough (error if not authenticated)
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(async (ctx, next) => {
  if (ctx.state.authData.userId) {
    ctx.state.currentUser = await ctx.orm.user.findById(ctx.state.authData.userId);
  }
  return next();
});

// authenticated endpoints
router.use('/players', playersRoutes.routes());
router.use('/teams', teamsRoutes.routes());
router.use('/matches', matchesRoutes.routes());
router.use('/sports', sportsRoutes.routes());

module.exports = router;
