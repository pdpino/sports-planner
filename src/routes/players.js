const KoaRouter = require('koa-router');
const playerSportsRouter = require('./playerSports');
const playerTeamsRouter = require('./playerTeams');
const playerMatchesRouter = require('./playerMatches');
const friendshipsRouter = require('./friendships');

const router = new KoaRouter();

/** Extract the User parameters from a params object (such as request.body) **/
function getUserParams(params){
  return {
    email: params.email,
    password: params.password,
    firstName: params.firstName,
    lastName: params.lastName,
    role: 'player',
  };
}

/** Extract the Player parameters from a params object (such as request.body) **/
function getPlayerParams(params){
  return {
    gender: params.gender || '', // HACK: Avoids null value reaching the model, ugly error message (the notEmpty msg should be used)
    birthday: params.birthday,
  };
}

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();

  await ctx.render('players/index', {
    players,
  });
});

router.get('playerNew', '/new', async (ctx) => {
  ctx.requireNoLogin();

  const user = ctx.orm.user.build(); // (ctx.request.body);
  const player = ctx.orm.player.build(); // (ctx.request.body);

  await ctx.render('players/new', {
    player,
    genders: ctx.orm.player.getGenders(),
    submitPlayerPath: ctx.router.url('playerCreate'),
    cancelPath : ctx.router.url('players'),
  });
});

router.post('playerCreate', '/', async (ctx) => {
  ctx.requireNoLogin();

  const userParams = getUserParams(ctx.request.body);
  const playerParams = getPlayerParams(ctx.request.body);

  let user = null;
  try {
    user = await ctx.orm.user.create(userParams);
    playerParams.userId = user.id;
    const player = await ctx.orm.player.create(playerParams);
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    if (user){ // User was created correctly, delete it
      // REVIEW: you may avoid saving to the DB and then deleting by using
      // build() and then save() methods on user and player
      user.destroy();
    }

    await ctx.render('players/new', {
      player: ctx.orm.player.build(ctx.request.body),
      genders: ctx.orm.player.getGenders(),
      errors: ctx.parseValidationError(validationError),
      submitPlayerPath: ctx.router.url('playerCreate'),
      cancelPath: ctx.router.url('players'),
    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const player = await ctx.findById(ctx.orm.player, ctx.params.id);

  ctx.requireModifyPermission(player.userId);

  await ctx.render('players/edit', {
    player,
    genders: ctx.orm.player.getGenders(),
    submitPlayerPath: ctx.router.url('playerUpdate', player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPath: ctx.router.url('player', { id: player.id }),
  });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const player = await ctx.findById(ctx.orm.player, ctx.params.id);

  ctx.requireModifyPermission(player.userId);

  const userParams = getUserParams(ctx.request.body);
  const playerParams = getPlayerParams(ctx.request.body);

  try {
    await player.user.update(userParams);
    await player.update(playerParams);
    ctx.redirect(ctx.router.url('player', { id: player.id }));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player,
      genders: ctx.orm.player.getGenders(),
      errors: ctx.parseValidationError(validationError),
      submitPlayerPath: ctx.router.url('playerUpdate', player.id),
      deletePlayerPath: ctx.router.url('playerDelete', player.id),
      cancelPath: ctx.router.url('player', { id: player.id }),
    });
  }
});

router.get('player', '/:id', async (ctx) => {
  // console.log("PLAYER/ PARAMS ID: ", ctx.params);
  // FIXME: sometimes the ctx.params.id is 'width="32"'
  const player = await ctx.findById(ctx.orm.player, ctx.params.id);
  const playerSports = await player.getSports();
  const playerTeams = await player.getTeams();
  const playerMatches = await player.getMatches();
  const friends = await player.getAllFriends();

  const friendshipStatus = (ctx.state.isPlayerLoggedIn
    && await ctx.state.currentPlayer.getFriendshipStatus(player));

  // const wallComments = await player.getMyWallComments();

  await ctx.render('players/show', {
    hasModifyPermission: ctx.state.hasModifyPermission(ctx, player.userId),
    player,
    playerSports,
    playerTeams,
    playerMatches,
    friends,
    editPlayerPath: ctx.router.url('playerEdit', player.id),
    // REFACTOR:
    canAddFriend: ctx.orm.player.canAddFriend(friendshipStatus),
    canDeleteFriend: ctx.orm.player.canDeleteFriend(friendshipStatus),
    canAcceptFriend: ctx.orm.player.canAcceptFriend(friendshipStatus),
    waitingFriend: ctx.orm.player.waitingFriend(friendshipStatus),
    addFriendPath: (friend) => ctx.router.url('friendNew', {
      playerId: ctx.state.currentPlayer.id,
      friendId: friend.id,
    }),
    deleteFriendPath: (friend) => ctx.router.url('friendDelete', {
      playerId: ctx.state.currentPlayer.id,
      friendId: friend.id,
    }),
    acceptFriendPath: (friend) => ctx.router.url('friendAccept', {
      playerId: ctx.state.currentPlayer.id,
      friendId: friend.id,
    }),
    newPlayerTeamPath: ctx.router.url('playerTeamNew', { playerId: player.id } ),
    deletePlayerTeamPath: (team) => ctx.router.url('playerTeamDelete', {
      playerId: player.id,
      id: team.id
    }),
    newPlayerMatchPath: ctx.router.url('playerMatchNew', { playerId: player.id } ),
    editPlayerMatchPath: (match) => ctx.router.url('playerMatchEdit', {
      playerId: player.id,
      id: match.id
    }),
    newPlayerSportPath: ctx.router.url('playerSportNew', { playerId: player.id } ),
    editPlayerSportPath: (sport) => ctx.router.url('playerSportEdit', {
      playerId: player.id,
      id: sport.id }
    ),
  });
});

router.delete('playerDelete', '/:id', async (ctx) => {
  const player = await ctx.findById(ctx.orm.player, ctx.params.id);

  ctx.requireModifyPermission(player.userId);

  await player.user.destroy(); // NOTE: player.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('players'));
});

router.use(
  '/:playerId/teams',
  async (ctx, next) => {
    ctx.state.player = await ctx.findById(ctx.orm.player, ctx.params.playerId);

    ctx.requireModifyPermission(ctx.state.player.userId);

    ctx.state.teams = await ctx.orm.team.findAll();
    ctx.state.playerTeams = await ctx.state.player.getTeams();
    return next();
  },
  playerTeamsRouter.routes(),
);

router.use(
  '/:playerId/matches',
  async (ctx, next) => {
    ctx.state.player = await ctx.findById(ctx.orm.player, ctx.params.playerId);

    ctx.requireModifyPermission(ctx.state.player.userId);

    const visibleMatches = await ctx.getVisibleMatches();
    const playerMatches = await ctx.state.player.getMatches();
    ctx.state.invitableMatches = ctx.substract(visibleMatches, playerMatches);
    return next();
  },
  playerMatchesRouter.routes(),
);

router.use(
  '/:playerId/sports',
  async (ctx, next) => {
    ctx.state.player = await ctx.findById(ctx.orm.player, ctx.params.playerId);

    ctx.requireModifyPermission(ctx.state.player.userId);

    const allSports = await ctx.orm.sport.findAll();
    const playerSports = await ctx.state.player.getSports();
    ctx.state.sportsNotPlayed = ctx.substract(allSports, playerSports);
    return next();
  },
  playerSportsRouter.routes(),
);

router.use(
  '/:playerId/friendships',
  async (ctx, next) => {
    ctx.state.player = await ctx.findById(ctx.orm.player, ctx.params.playerId);

    ctx.requireModifyPermission(ctx.state.player.userId);

    return next();
  },
  friendshipsRouter.routes(),
);

module.exports = router;
