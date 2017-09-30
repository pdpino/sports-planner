const KoaRouter = require('koa-router');

const index = require('./routes/index');
const sports = require('./routes/sports');
const players = require('./routes/players');
const teams = require('./routes/teams');
const matches = require('./routes/matches');
const session = require('./routes/session');
const compoundOwners = require('./routes/compoundOwners');

const router = new KoaRouter();

router.use(async (ctx, next) => {
  Object.assign(ctx.state, {
    currentUser: ctx.session.userId && await ctx.orm.user.findById(ctx.session.userId),
    newSessionPath: ctx.router.url('sessionNew'),
    destroySessionPath: ctx.router.url('sessionDestroy'),
    homePath: '/',
    // HACK: ctx.router.url('home') not working (returns '//' and page goes to about:blank)
    // path hardcoded
  });
  return next();
});

// Add helper functions
router.use((ctx, next) => {
  ctx.state.hasModifyPermission = (ctx, user) => ctx.session.userId == user.id;
  ctx.state.isLoggedIn = Boolean(ctx.state.currentUser);

  /** If the user doesn't have modify permissions it will be redirected to home **/
  ctx.state.requireModifyPermission = function(ctx, user){
    if(!ctx.state.hasModifyPermission(ctx, user)){
      console.log("NOTICE: you don't have modify permission");
      // TODO: send message to the user
      ctx.redirect('/');

      return false; // Require failed
    }
    return true; // Require passed
  }

  /** If is logged in, redirect to home **/
  ctx.state.requireNoLogin = function(ctx){
    if(isLoggedIn(ctx)){ // There is already an user logged in
      console.log("NOTICE: can't signup if you are already logged in");
      // TODO: show message to the user
      ctx.redirect('/');
      return false; // Require failed
    }
    return true; // Require passed
  }

  return next();
});


// Add actual routes
router.use('/', index.routes());
router.use('/sports', sports.routes());
router.use(
  '/teams',
  async (ctx, next) => {
    ctx.state.sports = await ctx.orm.sport.findAll();
    await next();
  },
  teams.routes(),
);

router.use('/players', players.routes());
router.use('/matches', matches.routes());
router.use('/compoundOwners', compoundOwners.routes());
router.use('/session', session.routes());

module.exports = router;
