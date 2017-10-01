const KoaRouter = require('koa-router');
const matchPlayersRouter = require('./matchPlayers');

async function getPlayerAndUser(ctx, playerId){
  // REVIEW: apparently not all calls of this need both user and player
  const player = await ctx.orm.player.findById(playerId);
  const user = player && await player.getUser();
  return { player, user };
}

async function getAllPlayersAndUsers(ctx,allPlayers){
  let fullPlayerUser=[]
  let aux;
  for(let i = 0; i < allPlayers.length; i++){
    aux=await getPlayerAndUser(ctx, allPlayers[i].id)
    fullPlayerUser.push(aux);
  }
  return fullPlayerUser;
}
const router = new KoaRouter();

/**Fix the parameters passed by the matches/_form.html.ejs (used when creating and when editing a match)*/
function fixSubmitParams(body){
  /* checkbox input passes 'on' when checked and null when not-checked. Parse this to boolean */
  body.isPublic = Boolean(body.isPublic);
}

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.orm.match.findAll();
  await ctx.render('matches/index', {
    matches,
    matchPath: match => ctx.router.url('match', { id: match.id }),
    newMatchPath: ctx.router.url('matchNew'),
  });
});

router.get('matchNew', '/new', async (ctx) => {
  const match = ctx.orm.match.build();
  await ctx.render('matches/new', {
    match,
    submitMatchPath: ctx.router.url('matchCreate'),
    cancelPath: ctx.router.url('matches'),
  });
});

router.post('matchCreate', '/', async (ctx) => {
  fixSubmitParams(ctx.request.body);
  try {
    const match = await ctx.orm.match.create(ctx.request.body);
    ctx.redirect(ctx.router.url('match', match.id ));
  } catch (validationError) {
    await ctx.render('matches/new', {
      match: ctx.orm.match.build(ctx.request.body),
      errors: validationError.errors,
      submitMatchPath: ctx.router.url('matchCreate'),
      cancelPath: ctx.router.url('matches'),
    });
  }
});

router.get('matchEdit', '/:id/edit', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  await ctx.render('matches/edit', {
    match,
    submitMatchPath: ctx.router.url('matchUpdate', match.id),
    cancelPath: ctx.router.url('match', { id: ctx.params.id }),
  });
});

router.patch('matchUpdate', '/:id', async (ctx) => {
  fixSubmitParams(ctx.request.body);
  const match = await ctx.orm.match.findById(ctx.params.id);
  try {
    await match.update(ctx.request.body);
    ctx.redirect(ctx.router.url('match', { id: match.id }));
  } catch (validationError) {
    await ctx.render('matches/edit', {
      match,
      errors: validationError.errors,
      submitMatchPath: ctx.router.url('matchUpdate', match.id),
      cancelPath: ctx.router.url('match', { id: ctx.params.id }),
    });
  }
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  const matchPlayers = await match.getPlayers();
  await ctx.render('matches/show', {
    match,
    matchPlayers,
    matchesPath: ctx.router.url('matches'),
    editMatchPath: ctx.router.url('matchEdit', match.id),
    getPlayerPath: (player) => ctx.router.url('player', player.id),
    newMatchPlayerPath: ctx.router.url('matchPlayerNew', { matchId: match.id } ),
    editMatchPlayerPath: (player) => ctx.router.url('matchPlayerEdit', {
      matchId: match.id,
      id: player.id
    }),
    deleteMatchPath: ctx.router.url('matchDelete', match.id),
  });
});

router.delete('matchDelete', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  await match.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('matches'));
});

router.use(
  '/:matchId/players',
  async (ctx, next) => {
    const match = await ctx.orm.match.findById(ctx.params.matchId);

    //if (!ctx.state.requireModifyPermission(ctx, user)) return;
    ctx.state.players= await ctx.orm.player.findAll();
    //ctx.state.players =  await getAllPlayersAndUsers(ctx,players);

    ctx.state.match = match;
    ctx.state.matchPlayers = await ctx.state.match.getPlayers();
    await next();
  },
  matchPlayersRouter.routes(),
);

module.exports = router;
