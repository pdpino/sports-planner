const KoaRouter = require('koa-router');
const matchPlayersRouter = require('./matchPlayers');

/** Given a match and the currentPlayer logged in, boolean indicating modify permission **/
async function hasModifyMatchPermission(match, currentPlayer){
  return currentPlayer && await match.hasPlayer(currentPlayer, {
    through: {
      where: { isAdmin: true }
    }
  });
}

/** Require modify team permissions, else redirect to home **/
async function requireModifyMatchPermission(ctx, match){
  const hasModifyPermission = await hasModifyMatchPermission(match, ctx.state.currentPlayer);
  if(!hasModifyPermission){
    ctx.redirect('/');
    return false; // Require failed
  }
  return true; // Require passed
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
    sports: ctx.state.sports,
    hasCreatePermission: ctx.state.isLoggedIn,
    matchPath: match => ctx.router.url('match', { id: match.id }),
    newMatchPath: ctx.router.url('matchNew'),
  });
});

router.get('matchNew', '/new', async (ctx) => {
  if (!ctx.state.requirePlayerLogin(ctx)) return;
  const match = ctx.orm.match.build();

  await ctx.render('matches/new', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchCreate'),
    cancelPath: ctx.router.url('matches'),
  });
});

router.post('matchCreate', '/', async (ctx) => {
  fixSubmitParams(ctx.request.body);
  if (!ctx.state.requirePlayerLogin(ctx)) return;
  try {
    const match = await ctx.orm.match.create(ctx.request.body);
    await ctx.state.currentPlayer.addMatch(match.id, {
    through: { isAdmin: true ,
       status: "accepted"
     }
    });
    ctx.redirect(ctx.router.url('match', match.id ));
  } catch (validationError) {
    await ctx.render('matches/new', {
      match: ctx.orm.match.build(ctx.request.body),
      errors: validationError.errors,
      sports: ctx.state.sports,
      submitMatchPath: ctx.router.url('matchCreate'),
      cancelPath: ctx.router.url('matches'),
    });
  }
});

router.get('matchEdit', '/:id/edit', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  if (! await requireModifyMatchPermission(ctx, match)) return;
  await ctx.render('matches/edit', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchUpdate', match.id),
    cancelPath: ctx.router.url('match', { id: ctx.params.id }),
  });
});

router.patch('matchUpdate', '/:id', async (ctx) => {
  fixSubmitParams(ctx.request.bosdy);
  const match = await ctx.orm.match.findById(ctx.params.id);
  if (! await requireModifyMatchPermission(ctx, match)) return;
  try {
    await match.update(ctx.request.body);
    ctx.redirect(ctx.router.url('match', { id: match.id }));
  } catch (validationError) {
    await ctx.render('matches/edit', {
      match,
      errors: validationError.errors,
      sports: ctx.state.sports,
      submitMatchPath: ctx.router.url('matchUpdate', match.id),
      cancelPath: ctx.router.url('match', { id: ctx.params.id }),
    });
  }
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.orm.match.findById(ctx.params.id);
  const sport = await ctx.orm.sport.findById(match.sportId);
  const matchPlayers = await match.getPlayers();
  const hasModifyPermission = await hasModifyMatchPermission(match, ctx.state.currentPlayer);
  await ctx.render('matches/show', {
    match,
    matchPlayers,
    hasModifyPermission,
    sport: sport.name,
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
  if (! await requireModifyMatchPermission(ctx, match)) return;
  const match = await ctx.orm.match.findById(ctx.params.id);
  await match.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('matches'));
});

router.use(
  '/:matchId/players',
  async (ctx, next) => {
    const match = await ctx.orm.match.findById(ctx.params.matchId);

    if (! await requireModifyMatchPermission(ctx, match)) return;

    ctx.state.players = await ctx.orm.player.findAll();
    
    ctx.state.match = match;
    ctx.state.matchPlayers = await ctx.state.match.getPlayers();
    await next();
  },
  matchPlayersRouter.routes(),
);

module.exports = router;
