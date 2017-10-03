const KoaRouter = require('koa-router');

const index = require('./routes/index');
const sports = require('./routes/sports');
const players = require('./routes/players');
const teams = require('./routes/teams');
const matches = require('./routes/matches');
const session = require('./routes/session');
const compoundOwners = require('./routes/compoundOwners');
const compound = require('./routes/compounds');

const router = new KoaRouter();

router.use(async (ctx, next) => {
  // Load user and (player or owner)
  const currentUser = ctx.session.userId && await ctx.orm.user.findById(ctx.session.userId);
  let currentPlayer = null;
  let currentOwner = null;

  if (currentUser){ // NOTE: don't use oneline assignation for clarity
    if (currentUser.role == 'player'){
      currentPlayer = await ctx.orm.player.find({
        where: { userId: currentUser.id }
      });
    }
    else if (currentUser.role == 'owner'){
      currentOwner = await ctx.orm.player.find({
        where: { userId: currentUser.id }
      });
    }
  }

  Object.assign(ctx.state, {
    currentUser,
    currentPlayer,
    currentOwner,
    newSessionPath: ctx.router.url('sessionNew'),
    signUpPlayerPath: ctx.router.url('playerNew'),
    signUpOwnerPath: ctx.router.url('compoundOwnerNew'),
    destroySessionPath: ctx.router.url('sessionDestroy'),
    homePath: '/',
    // HACK: ctx.router.url('home') not working (returns '//' and page goes to about:blank)
    // path hardcoded
  });
  return next();
});

/** Add helper functions
 * See https://github.com/embbnux/kails (koa in rails style) for examples on helper functions
 **/
router.use((ctx, next) => {
  ctx.state.hasAdminPermission = ctx.state.currentUser && ctx.state.currentUser.role == 'admin';
  ctx.state.hasModifyPermission = (ctx, user) => ctx.session.userId == user.id;
  ctx.state.isLoggedIn = Boolean(ctx.state.currentUser);
  ctx.state.isPlayerLoggedIn = Boolean(ctx.state.currentPlayer);
  ctx.state.isOwnerLoggedIn = Boolean(ctx.state.currentOwner);

  /** If the user doesn't have modify permissions it will be redirected to home **/
  ctx.state.requireModifyPermission = function(ctx, user){
    if(!ctx.state.hasModifyPermission(ctx, user)){
      console.log("NOTICE: you don't have modify permission");
      ctx.redirect('/');
      return false; // Require failed
    }
    return true; // Require passed
  }

  /** If the user doesn't have admin permissions it will be redirected to home **/
  ctx.state.requireAdminPermission = function(ctx){
    if(!ctx.state.hasAdminPermission){
      console.log("NOTICE: you don't have admin permission");
      ctx.redirect('/');
      return false; // Require failed
    }
    return true; // Require passed
  }

  /** If not logged in, redirect to home **/
  ctx.state.requirePlayerLogin = function(ctx){
    if(!ctx.state.isPlayerLoggedIn){ // There is already an user logged in
      console.log("NOTICE: you are not signed in as a player");
      // TODO: show message to the user

      ctx.redirect('/');
      return false; // Require failed
    }
    return true; // Require passed
  }

  /** If is logged in, redirect to home **/
  ctx.state.requireNoLogin = function(ctx){
    if(ctx.state.isLoggedIn){ // There is already an user logged in
      console.log("NOTICE: can't signup if you are already logged in");
      // TODO: show message to the user

      ctx.redirect('/'); // TODO: customize where to redirect
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
router.use(
  '/matches',
  async (ctx, next) => {
    ctx.state.sports = await ctx.orm.sport.findAll();
    await next();
  },
  matches.routes(),
);
router.use('/compoundOwners', compoundOwners.routes());
router.use('/session', session.routes());
router.use('/compounds', compound.routes());

module.exports = router;
