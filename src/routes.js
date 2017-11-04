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

/** Add basic info and functions **/
router.use(async (ctx, next) => {
  // Load user and (player or owner)
  const currentUser = ctx.session.userId && await ctx.orm.user.findById(ctx.session.userId);
  let currentPlayer = null;
  let currentOwner = null;
  let profilePath = null;

  if (currentUser){
    if (currentUser.role == 'player'){
      currentPlayer = await ctx.orm.player.find({
        where: { userId: currentUser.id }
      });
      profilePath = ctx.router.url('player', { id: currentPlayer.id });
    }
    else if (currentUser.role == 'owner'){
      currentOwner = await ctx.orm.compoundOwner.find({
        where: { userId: currentUser.id }
      });
      profilePath = ctx.router.url('compoundOwner', { id: currentOwner.id });
    }
  }

  Object.assign(ctx.state, {
    currentUser,
    currentPlayer,
    currentOwner,
    profilePath,
    newSessionPath: ctx.router.url('sessionNew'),
    signUpPlayerPath: ctx.router.url('playerNew'),
    signUpOwnerPath: ctx.router.url('compoundOwnerNew'),
    destroySessionPath: ctx.router.url('sessionDestroy'),
    getSportPath: (sport) => ctx.router.url('sport', sport.id),
    getPlayerPath: (player) => ctx.router.url('player', player.id),
    getCompoundOwnerPath: (compoundOwner) => ctx.router.url('compoundOwner', compoundOwner.id),
    getCompoundPath: (compound) => ctx.router.url('compound', compound.id),
    getFieldPath: (field) => ctx.router.url('field', { compoundId: field.compoundId, id: field.id }),
    getTeamPath: (team) => ctx.router.url('team', team.id),
    getMatchPath: (match) => ctx.router.url('match', match.id),
    sportsPath: ctx.router.url('sports'),
    teamsPath: ctx.router.url('teams'),
    playersPath: ctx.router.url('players'),
    matchesPath: ctx.router.url('matches'),
    compoundOwnersPath: ctx.router.url('compoundOwners'),
    compoundsPath: ctx.router.url('compounds'),
    homePath: '/',
    // HACK: ctx.router.url('home') not working (returns '//' and page goes to about:blank)
    // path hardcoded
  });
  return next();
});

/** Add helper require and login functions
 * See https://github.com/embbnux/kails (koa in rails style) for examples on helper functions
 **/
router.use((ctx, next) => {
  Object.assign(ctx.state, {
    hasAdminPermission: ctx.state.currentUser && ctx.state.currentUser.role == 'admin',
    hasModifyPermission: (ctx, userId) => ctx.session.userId == userId,
    hasOwnerModifyPermission: (ctx, owner) => ctx.state.currentOwner && ctx.state.currentOwner.id == owner.id,
    isLoggedIn: Boolean(ctx.state.currentUser),
    isPlayerLoggedIn: Boolean(ctx.state.currentPlayer),
    isOwnerLoggedIn: Boolean(ctx.state.currentOwner),
  });

  return next();
});

/** Expose methods to the views **/
router.use((ctx, next) => {
  // NOTE: if the function uses 'this' you must bind it so 'this' is the ctx instance
  // example: ctx.state.f = ctx.f.bind(ctx);

  ctx.state.invitationToString = ctx.invitationToString;
  ctx.state.createdAtTimestamp = ctx.createdAtTimestamp;
  ctx.state.canDeleteComment = ctx.canDeleteComment.bind(ctx);

  return next();
});


// Add actual routes
router.use('/', index.routes());
router.use('/sports', sports.routes());
router.use(
  '/teams',
  async (ctx, next) => {
    ctx.state.allSports = await ctx.orm.sport.findAll();
    return next();
  },
  teams.routes(),
);

router.use('/players', players.routes());
router.use(
  '/matches',
  async (ctx, next) => {
    ctx.state.allSports = await ctx.orm.sport.findAll();
    return next();
  },
  matches.routes(),
);
router.use('/compoundOwners', compoundOwners.routes());
router.use('/session', session.routes());
router.use('/compounds', compound.routes());

module.exports = router;
