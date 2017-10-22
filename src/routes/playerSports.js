const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedSport is in playerSports **/
function doesPlayerPlay(searchedSport, playerSports){
  return Boolean(playerSports.find((sport) => sport.id == searchedSport.id));
}

/** Return the difference between allSports and playerSports **/
function getSportsNotPlayed(allSports, playerSports){
  // OPTIMIZE ???
  return allSports.filter( (anySport) => {
    return !doesPlayerPlay(anySport, playerSports);
  });
}

/** Return the sport played by player, searching with sportId **/
async function findPlayerSportById(player, sportId){
  // OPTIMIZE? use a model function?
  const playerSports = await player.getSports( { where: { id: sportId } } );
  return (playerSports.length == 1) ? playerSports[0] : null;
}

router.get('playerSportNew', '/new', async (ctx) => {
  await ctx.render('playerSports/new', {
    player: ctx.state.player,
    sportsNotPlayed: getSportsNotPlayed(ctx.state.sports, ctx.state.playerSports),
    submitPlayerSportPath: ctx.router.url('playerSportCreate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.post('playerSportCreate', '/', async (ctx) => {
  const playSport = await findPlayerSportById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addSport(ctx.request.body.sportId, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    await ctx.render('playerSports/new', {
      player: ctx.state.player,
      sportsNotPlayed: getSportsNotPlayed(ctx.state.sports, ctx.state.playerSports),
      errors: ctx.state.parseValidationError(validationError),
      submitPlayerSportPath: ctx.router.url('playerSportCreate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.get('playerSportEdit', '/:id/edit', async (ctx) => {
  const playSport = await findPlayerSportById(ctx.state.player, ctx.params.id);
  await ctx.render('playerSports/edit', {
    player: ctx.state.player,
    playSport,
    submitPlayerSportPath: ctx.router.url('playerSportUpdate', { playerId: ctx.state.player.id, id: playSport.id }),
    deletePlayerSportPath: ctx.router.url('playerSportDelete', { playerId: ctx.state.player.id, id: playSport.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.patch('playerSportUpdate', '/:id', async (ctx) => {
  const playSport = await findPlayerSportById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addSport(playSport, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    await ctx.render('playerSports/edit', {
      player: ctx.state.player,
      playSport,
      errors: ctx.state.parseValidationError(validationError),
      submitPlayerSportPath: ctx.router.url('playerSportUpdate', { playerId: ctx.state.player.id, id: playSport.id }),
      cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
    });
  }
});

router.delete('playerSportDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeSport(ctx.params.id);
   ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
 });


module.exports = router;
