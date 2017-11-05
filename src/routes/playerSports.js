const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('playerSportNew', '/new', async (ctx) => {
  await ctx.render('playerSports/new', {
    player: ctx.state.player,
    // sportsNotPlayed: ctx.state.sportsNotPlayed,
    submitPlayerSportPath: ctx.router.url('playerSportCreate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.post('playerSportCreate', '/', async (ctx) => {
  try {
    await ctx.state.player.playSport(ctx.request.body.sportId, ctx.request.body.position);
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    await ctx.render('playerSports/new', {
      player: ctx.state.player,
      // sportsNotPlayed: ctx.state.sportsNotPlayed,
      errors: ctx.parseValidationError(validationError),
      submitPlayerSportPath: ctx.router.url('playerSportCreate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.get('playerSportEdit', '/:id/edit', async (ctx) => {
  const playSport = await ctx.state.player.getSport(ctx.params.id);
  ctx.assert(playSport, 404);

  await ctx.render('playerSports/edit', {
    player: ctx.state.player,
    playSport,
    submitPlayerSportPath: ctx.router.url('playerSportUpdate', {
      playerId: ctx.state.player.id,
      id: playSport.id
    }),
    deletePlayerSportPath: ctx.router.url('playerSportDelete', {
      playerId: ctx.state.player.id,
      id: playSport.id
    }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.patch('playerSportUpdate', '/:id', async (ctx) => {
  const playSport = await ctx.state.player.getSport(ctx.params.id);
  ctx.assert(playSport, 404);

  try {
    await ctx.state.player.playSport(playSport, ctx.request.body.position);
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    await ctx.render('playerSports/edit', {
      player: ctx.state.player,
      playSport,
      errors: ctx.parseValidationError(validationError),
      submitPlayerSportPath: ctx.router.url('playerSportUpdate', {
        playerId: ctx.state.player.id,
        id: playSport.id
      }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.delete('playerSportDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeSport(ctx.params.id);
   ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
 });


module.exports = router;
