const KoaRouter = require('koa-router');

const index = require('./routes/index');
const sports = require('./routes/sports');
const players = require('./routes/players');
const users = require('./routes/users');
const teams = require('./routes/teams');
const matches = require('./routes/matches');
const session = require('./routes/session');
const compoundOwners = require('./routes/compoundOwners');
const compound = require('./routes/compounds');

const router = new KoaRouter();

/** Add currentUser information (and currentPlayer/currentOwner) **/
router.use(async (ctx, next) => {
  await ctx.loadCurrentUser(ctx.session);
  return next();
});

/** Expose paths to the views **/
router.use((ctx, next) => {
  let profilePath;
  if (ctx.state.isPlayerLoggedIn) {
    profilePath = ctx.router.url('player', ctx.state.currentPlayer.id);
  } else if (ctx.state.isOwnerLoggedIn) {
    profilePath = ctx.router.url('compoundOwner', ctx.state.currentOwner.id);
  } else {
    profilePath = '/';
  }

  Object.assign(ctx.state, {
    profilePath,
    newSessionPath: ctx.router.url('sessionNew'),
    signUpPlayerPath: ctx.router.url('playerNew'),
    signUpOwnerPath: ctx.router.url('compoundOwnerNew'),
    destroySessionPath: ctx.router.url('sessionDestroy'),
    homePath: '/',
    // HACK: ctx.router.url('home') not working (returns '//' and page goes to about:blank)
    // path hardcoded
    getSportPath: (sport) => ctx.router.url('sport', sport.id),
    getPlayerPath: (player) => ctx.router.url('player', player.id),
    getCompoundOwnerPath: (compoundOwner) => ctx.router.url('compoundOwner', compoundOwner.id),
    getCompoundPath: (compound) => ctx.router.url('compound', compound.id),
    getFieldPath: (field) => ctx.router.url('field', {
      compoundId: field.compoundId,
      id: field.id
    }),
    getTeamPath: (team) => ctx.router.url('team', team.id),
    getMatchPath: (match) => ctx.router.url('match', match.id),
    sportsPath: ctx.router.url('sports'),
    teamsPath: ctx.router.url('teams'),
    playersPath: ctx.router.url('players'),
    matchesPath: ctx.router.url('matches'),
    compoundOwnersPath: ctx.router.url('compoundOwners'),
    compoundsPath: ctx.router.url('compounds'),
    indexPath: ctx.router.url('index'),
    cancelPath: ctx.headers['referer'] || '/', // cancelPath by default is to go back
  });
  return next();
});

/** Expose methods to the views **/
router.use((ctx, next) => {
  // NOTE: if the function uses 'this' you must bind it so 'this' is the ctx instance
  // example: ctx.state.f = ctx.f.bind(ctx);

  ctx.state.invitationToString = ctx.invitationToString;
  ctx.state.prettyTimestamp = ctx.prettyTimestamp.bind(ctx);
  ctx.state.prettyDatestamp = ctx.prettyDatestamp.bind(ctx);
  ctx.state.createdAtTimestamp = ctx.createdAtTimestamp.bind(ctx);
  ctx.state.updatedAtTimestamp = ctx.updatedAtTimestamp.bind(ctx);
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
router.use('/users', users.routes());

module.exports = router;
