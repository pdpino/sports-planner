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

  // More elaborated functions:

  ctx.state.requireModifyPermission = function(ctx, userId, options={}){
    ctx.assert(ctx.state.hasModifyPermission(ctx, userId), 403, options.message || "No tienes permisos para editar");
  }

  ctx.state.requireOwnerModifyPermission = function(ctx, owner, options={}){
    ctx.assert(ctx.state.hasOwnerModifyPermission(ctx, owner), 403, options.message || "No tienes permisos para editar");
  }

  ctx.state.requireAdminPermission = function(ctx, options={}){
    ctx.assert(ctx.state.hasAdminPermission, 404, options.message || "Debes ser admin", {});
  }

  ctx.state.requirePlayerLoggedIn = function(ctx, options={}){
    ctx.assert(ctx.state.isPlayerLoggedIn, 403, options.message || "Debes ser jugador", {});
  }

  ctx.state.requireOwnerLoggedIn = function(ctx, options={}){
    ctx.assert(ctx.state.isOwnerLoggedIn, 403, options.message || "Debes ser dueño de recinto", {});
  }

  ctx.state.requireNoLogin = function(ctx, options={}){
    ctx.assert(!ctx.state.isLoggedIn, 403, options.message || "Ya iniciaste sesión", {});
  }

  return next();
});

/** Add invitation helper functions **/
router.use((ctx, next) => {
  /** Transform an isPlayerInvited status to a message for the user **/
  ctx.state.invitationToString = function(status){
    // TODO: adecuate message considering if is an invitation for me or I am deciding (see matchesShow and matchesPlayerEdit)
    const statusMessages = {
      'sent': 'No responder aún',
      'asked': 'Esperando confirmación del administrador del partido',
      'rejectedByUser': 'Rechazar invitación',
      'rejectedByAdmin': 'Solicitud rechazada',
      'accepted': 'Aceptar invitación'
    };
    return statusMessages[status] || status;
  }

  ctx.state.eligibleStatuses = function (status, isUser) {
    if (isUser) { // Is the user invited to the event
      if (status == 'accepted' || status == 'rejectedByUser' || status == 'sent') {
        return ['accepted', 'rejectedByUser', 'sent'];
      }
    } else { // Is the admin of the event
      if (status == 'accepted' || status == 'rejectedByAdmin' || status == 'asked') {
        return ['accepted', 'rejectedByAdmin', 'asked'];
      }
    }

    return null; // Is not in his hands to respond the invitation
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
