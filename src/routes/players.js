const KoaRouter = require('koa-router');

const router = new KoaRouter();

/**
 * Boolean if searchedSport is in playSports
 */
function doesPlayerPlay(searchedSport, playSports=[]){
  return playSports.find((sport) => sport.name === searchedSport.name);
}

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();
  await ctx.render('players/index', {
    players,
    playerPath: player => ctx.router.url('playerShow', { id: player.id }),
    newPlayerPath: ctx.router.url('playerNew'),
   });
});

router.post('playerCreate', '/', async (ctx) => {
  try {
    const player = await ctx.orm.player.create(ctx.request.body);
    await player.setSports(ctx.request.body.playSports);
    ctx.redirect(ctx.router.url('players'));
  } catch (validationError) {
    const sports = await ctx.orm.sport.findAll();
    await ctx.render('players/new', {
      player: ctx.orm.player.build(ctx.request.body),
      errors: validationError.errors,
      sports,
      playSports: ctx.request.body.playSports,
      doesPlayerPlay,
      submitPlayerPath: ctx.router.url('playerCreate'),
      cancelPath: ctx.router.url('players'),
    });
  }
});

router.get('playerNew', '/new', async (ctx) => {
  const player = ctx.orm.player.build(ctx.request.body);
  const sports = await ctx.orm.sport.findAll();
  await ctx.render('players/new', {
    player,
    sports,
    playSports: [],
    doesPlayerPlay: (sport, playSports) => { return false; },
    submitPlayerPath: ctx.router.url('playerCreate'),
    cancelPath : ctx.router.url('players'),
  });
});

router.get('playerShow', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  const playSports = await player.getSports();
  await ctx.render('players/show', {
    player,
    playSports,
    doesPlayerPlay, // (sport) => { isSportIn(sport.name, playSports) },
    editPlayerPath: ctx.router.url('playerEdit', player.id),
    playersPath: ctx.router.url('players'),
   });
});

router.patch('playerUpdate', '/:id', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  try {
    await player.update(ctx.request.body);
    await player.setSports(ctx.request.body.playSports);
    ctx.redirect(ctx.router.url('playerShow', { id: player.id }));
  } catch (validationError) {
    const sports = await ctx.orm.sport.findAll();
    await ctx.render('players/edit', {
      player,
      sports,
      playSports: ctx.request.body.playSports,
      doesPlayerPlay,
      errors: validationError.errors,
      submitPlayerPath: ctx.router.url('playerUpdate', player.id),
      deletePlayerPath: ctx.router.url('playerDelete', player.id),
      cancelPath: ctx.router.url('playerShow', player.id),
    });
  }
});

router.get('playerEdit', '/:id/edit', async (ctx) => {
  const player = await ctx.orm.player.findById(ctx.params.id);
  const sports = await ctx.orm.sport.findAll();
  const playSports = await player.getSports();
  await ctx.render('players/edit', {
    player,
    sports,
    playSports,
    doesPlayerPlay,
    submitPlayerPath: ctx.router.url('playerUpdate', player.id),
    deletePlayerPath: ctx.router.url('playerDelete', player.id),
    cancelPath: ctx.router.url('playerShow', player.id)
  });
});

router.delete('playerDelete', '/:id', async (ctx) => {
   const player = await ctx.orm.player.findById(ctx.params.id);
   await player.destroy();
   ctx.redirect(ctx.router.url('players'));
 });

module.exports = router;
