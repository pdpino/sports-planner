const KoaRouter = require('koa-router');
const playerSportsRouter = require('./playerSports');
const playerTeamsRouter = require('./playerTeams');
const playerMatchesRouter = require('./playerMatches');
const friendshipsRouter = require('./friendships');

const router = new KoaRouter();

/** Calculate the age of the player given his birthday**/
function calculateAge(birthday){
  // OPTIMIZE this function? dates can be substracted
  // TODO: move this to model
  const today = new Date();

  const year = birthday.substring(0,4);
  const month = birthday.substring(5,7);
  const day = birthday.substring(8,10);

  const dateBirthday = new Date(year, month-1, day);
  const diff =  today - dateBirthday;
  const age = Math.floor(diff/(1000*60*60*24*365.25));
  return age;
}

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

/** Load the player and the user from the database **/
async function getPlayerAndUser(ctx, playerId){
  // REVIEW: apparently not all calls of this need both user and player
  const player = await ctx.state.findById(ctx.orm.player, playerId);
  const user = await player.getUser();
  return { player, user };
}

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();

  await ctx.render('players/index', {
    players,
  });
});

router.get('playerNew', '/new', async (ctx) => {
  ctx.state.requireNoLogin(ctx);

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
  ctx.state.requireNoLogin(ctx);

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
      errors: ctx.state.parseValidationError(validationError),
      submitPlayerPath: ctx.router.url('playerCreate'),
      cancelPath: ctx.router.url('players'),
    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const player = await ctx.state.findById(ctx.orm.player, ctx.params.id);

  ctx.state.requireModifyPermission(ctx, player.userId);

  await ctx.render('players/edit', {
    player,
    genders: ctx.orm.player.getGenders(),
    submitPlayerPath: ctx.router.url('playerUpdate', player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPath: ctx.router.url('player', { id: player.id }),
  });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const { player, user } = await getPlayerAndUser(ctx, ctx.params.id);

  ctx.state.requireModifyPermission(ctx, user.id);

  const userParams = getUserParams(ctx.request.body);
  const playerParams = getPlayerParams(ctx.request.body);

  try {
    await user.update(userParams);
    await player.update(playerParams);
    ctx.redirect(ctx.router.url('player', { id: player.id }));
  } catch (validationError) {
    await ctx.render('players/edit', {
      player,
      genders: ctx.orm.player.getGenders(),
      errors: ctx.state.parseValidationError(validationError),
      submitPlayerPath: ctx.router.url('playerUpdate', player.id),
      deletePlayerPath: ctx.router.url('playerDelete', player.id),
      cancelPath: ctx.router.url('player', { id: player.id }),
    });
  }
});

router.get('player', '/:id', async (ctx) => {
  // console.log("PLAYER/ PARAMS ID: ", ctx.params);
  // FIXME: sometimes the ctx.params.id is 'width="32"'
  const player = await ctx.state.findById(ctx.orm.player, ctx.params.id);
  const playerSports = await player.getSports();
  const playerTeams = await player.getTeams();
  const playerMatches = await player.getMatches();
  const playerAge = calculateAge(player.birthday);
  const friends = await player.getFriends();

  const friendshipStatus = (ctx.state.isPlayerLoggedIn
    && await ctx.state.currentPlayer.getFriendshipStatus(player));

  await ctx.render('players/show', {
    hasModifyPermission: ctx.state.hasModifyPermission(ctx, player.userId),
    player,
    playerAge,
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
  const { player, user } = await getPlayerAndUser(ctx, ctx.params.id);

  ctx.state.requireModifyPermission(ctx, user.id);

  await user.destroy(); // NOTE: player.destroy() is not neccesary beause onDelete: cascade
  ctx.redirect(ctx.router.url('players'));
});

router.use(
  '/:playerId/teams',
  async (ctx, next) => {
    ctx.state.player = await ctx.state.findById(ctx.orm.player, ctx.params.playerId);

    ctx.state.requireModifyPermission(ctx, ctx.state.player.userId);

    ctx.state.teams = await ctx.orm.team.findAll();
    ctx.state.playerTeams = await ctx.state.player.getTeams();
    await next();
  },
  playerTeamsRouter.routes(),
);

router.use(
  '/:playerId/matches',
  async (ctx, next) => {
    ctx.state.player = await ctx.state.findById(ctx.orm.player, ctx.params.playerId);

    ctx.state.requireModifyPermission(ctx, ctx.state.player.userId);

    ctx.state.visibleMatches = await ctx.state.getVisibleMatches(ctx);
    ctx.state.playerMatches = await ctx.state.player.getMatches();
    await next();
  },
  playerMatchesRouter.routes(),
);

router.use(
  '/:playerId/sports',
  async (ctx, next) => {
    ctx.state.player = await ctx.state.findById(ctx.orm.player, ctx.params.playerId);

    ctx.state.requireModifyPermission(ctx, ctx.state.player.userId);

    ctx.state.sports = await ctx.orm.sport.findAll();
    ctx.state.playerSports = await ctx.state.player.getSports();
    await next();
  },
  playerSportsRouter.routes(),
);

router.use(
  '/:playerId/friendships',
  async (ctx, next) => {
    ctx.state.player = await ctx.state.findById(ctx.orm.player, ctx.params.playerId);

    ctx.state.requireModifyPermission(ctx, ctx.state.player.userId);

    await next();
  },
  friendshipsRouter.routes(),
);

module.exports = router;
