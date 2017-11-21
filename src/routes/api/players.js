const KoaRouter = require('koa-router');
const FileStorage = require('../../services/file-storage');

const router = new KoaRouter();

/** Extract the User parameters from a params object (such as request.body) **/
// REFACTOR: this functions are copied in ui-routes (routes/players.js)
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
    gender: params.gender || '',
    birthday: params.birthday,
  };
}

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();

  // console.log("QUERY: ", ctx.query);

  ctx.body = ctx.serializePlayers(players);
});

router.post('playerCreate', '/', async (ctx) => {
  ctx.requireNoLogin();

  // REFACTOR: this router is copied in ui-router (except for the json answers)
  // The creation should be moved to the user model

  const userParams = getUserParams(ctx.request.body.fields);
  const playerParams = getPlayerParams(ctx.request.body.fields);

  let user;
  try {
    user = await ctx.orm.user.create(userParams);
    userParams.photo = FileStorage.url("user" + user.id,{});
    await user.update(userParams);
    playerParams.userId = user.id;
    const player = await ctx.orm.player.create(playerParams);
    FileStorage.upload(ctx.request.body.files.photo, "user" + user.id);

    ctx.respondApi('Jugador fue creado con éxito');
  } catch (validationError) {
    // TODO: also delete created photo (if any)
    if (user){ // User was created correctly, delete it
      // REVIEW: you may avoid saving to the DB and then deleting by using
      // build() and then save() methods on user and player
      user.destroy();
    }

    ctx.body = {
      message: 'No se pudo crear jugador',
      errors: ctx.parseValidationError(validationError),
    }
  }
});

router.get('player', '/:id', async (ctx) => {
  const player = await ctx.findById(ctx.orm.player.scope('api'), ctx.params.id);

  const includeSports = true;
  const includeTeams = true;
  const includeMatches = true;

  ctx.body = ctx.serializePlayer(player, {
    includeSports,
    includeTeams,
    includeMatches,
  });
});

module.exports = router;
