const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const authRoutes = require('./auth');
const playersRoutes = require('./players');
const teamsRoutes = require('./teams');
const matchesRoutes = require('./matches');
const sportsRoutes = require('./sports');
const compoundOwnersRoutes = require('./compoundOwners');
const compoundsRoutes = require('./compounds');
const fieldsRoutes = require('./fields');

const router = new KoaRouter();

// unauthenticated endpoints
router.use('/auth', authRoutes.routes());
router.use('/players', playersRoutes.routes());

// JWT authentication without passthrough (error if not authenticated)
router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(async (ctx, next) => {
  if (ctx.state.authData.userId) {
    await ctx.loadCurrentUser(ctx.state.authData);
  }
  return next();
});

// authenticated endpoints
router.use('/teams', teamsRoutes.routes());
router.use('/matches', matchesRoutes.routes());
router.use('/sports', sportsRoutes.routes());
router.use('/compoundOwners', compoundOwnersRoutes.routes());
router.use('/compounds', compoundsRoutes.routes());
router.use('/fields', fieldsRoutes.routes());

module.exports = router;
