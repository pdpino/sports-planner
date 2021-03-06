const KoaRouter = require('koa-router');
const playerSportsRouter = require('./playerSports');
const playerTeamsRouter = require('./playerTeams');
const playerMatchesRouter = require('./playerMatches');
const friendshipsRouter = require('./friendships');
const wallCommentsRouter = require('./wallComments');
const FileStorage = require('../services/file-storage');

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

  const user = ctx.orm.user.build();
  const player = ctx.orm.player.build();

  await ctx.render('players/new', {
    player,
    genders: ctx.orm.player.getGenders(),
    submitPlayerPath: ctx.router.url('playerCreate'),
    cancelPath: '/',
  });
});

router.post('playerCreate', '/', async (ctx) => {
  ctx.requireNoLogin();

  const userParams = getUserParams(ctx.request.body.fields);
  const playerParams = getPlayerParams(ctx.request.body.fields);
  const photoFile = ctx.request.body.files.photo;
  const anyPhoto = photoFile.name;

  let user;
  try {
    user = await ctx.orm.user.create(userParams);
    if (anyPhoto) {
      userParams.photo = FileStorage.url("user" + user.id,{});
      await user.update(userParams);
    }
    playerParams.userId = user.id;
    const player = await ctx.orm.player.create(playerParams);

    if (anyPhoto) {
      FileStorage.upload(photoFile, "user" + user.id);
    }

    await ctx.login(user.email, userParams.password);
  } catch (validationError) {
    // TODO: also delete created photo (if any)
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
      cancelPath: '/',
    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const player = await ctx.findById(ctx.orm.player, ctx.params.id);

  ctx.requireModifyPermission(player);

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

  ctx.requireModifyPermission(player);

  const userParams = getUserParams(ctx.request.body.fields);
  const playerParams = getPlayerParams(ctx.request.body.fields);
  const photoFile = ctx.request.body.files.photo;
  const anyPhoto = photoFile.name;

  try {
    if (anyPhoto) {
      userParams.photo = FileStorage.url("user"+player.user.id,{});
      await player.user.update(userParams);
    }
    await player.update(playerParams);
    if (anyPhoto) {
      FileStorage.upload(photoFile, "user"+player.user.id);
    }
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
  const player = await ctx.findById(ctx.orm.player, ctx.params.id);
  const playerSports = await player.getSports();
  const playerTeams = await player.getTeamsWithSport();
  const playerMatches = await player.getMatches();
  const friends = await player.getAllFriends();
  const reviewsAverage = await player.getReviewsAverage();

  const friendshipStatus = (ctx.state.isPlayerLoggedIn
    && await ctx.state.currentPlayer.getFriendshipStatus(player));

  const hasCommentPermission = ctx.orm.player.hasCommentPermission(friendshipStatus);
  const wallComments = hasCommentPermission && await player.getMyWallComments();

  const reviews = await player.getDoneReviews();

  await ctx.render('players/show', {
    hasModifyPermission: ctx.hasModifyPermission(player),
    player,
    reviewsAverage,
    playerSports,
    playerTeams,
    playerMatches,
    friends,
    wallComments,
    reviews,
    canComment: hasCommentPermission,
    canSeeComments: hasCommentPermission,
    createCommentPath: ctx.router.url('wallCommentCreate', { playerId: player.id }),
    deleteCommentPath: (comment) => ctx.router.url('wallCommentDelete', {
      playerId: player.id,
      id: comment.id
    }),
    // REFACTOR?:
    canAddFriend: ctx.orm.player.canAddFriend(friendshipStatus),
    canDeleteFriend: ctx.orm.player.canDeleteFriend(friendshipStatus),
    canAcceptFriend: ctx.orm.player.canAcceptFriend(friendshipStatus),
    waitingFriend: ctx.orm.player.waitingFriend(friendshipStatus),
    addFriendPath: (friend) => ctx.router.url('friendCreate', {
      playerId: ctx.state.currentPlayer.id,
      friendId: friend.id,
    }),
    editPlayerPath: ctx.router.url('playerEdit', player.id),
    deleteFriendPath: (friend) => ctx.router.url('friendDelete', {
      playerId: ctx.state.currentPlayer.id,
      friendId: friend.id,
    }),
    acceptFriendPath: (friend) => ctx.router.url('friendAccept', {
      playerId: ctx.state.currentPlayer.id,
      friendId: friend.id,
    }),
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
      id: sport.id
    }),
    newTeamPath: ctx.router.url('teamNew'),
  });
});

router.delete('playerDelete', '/:id', async (ctx) => {
  const player = await ctx.findById(ctx.orm.player, ctx.params.id);

  ctx.requireModifyPermission(player);
  FileStorage.destroy(player.user.email);
  await player.user.destroy(); // NOTE: player.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('players'));
});

router.use(
  '/:playerId/teams',
  async (ctx, next) => {
    ctx.state.player = await ctx.findById(ctx.orm.player, ctx.params.playerId);

    ctx.requireModifyPermission(ctx.state.player);

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

    ctx.requireModifyPermission(ctx.state.player);

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

    ctx.requireModifyPermission(ctx.state.player);

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

    ctx.requireModifyPermission(ctx.state.player);

    return next();
  },
  friendshipsRouter.routes(),
);

router.use(
  '/:playerId/comments',
  async (ctx, next) => {
    ctx.state.player = await ctx.findById(ctx.orm.player, ctx.params.playerId);

    return next();
  },
  wallCommentsRouter.routes(),
);

module.exports = router;
