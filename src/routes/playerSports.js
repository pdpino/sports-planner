const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Boolean if searchedSport is in playSports **/
function doesPlayerPlay(searchedSport, playSports){
  return Boolean(playSports.find((sport) => sport.id == searchedSport.id));
}

/** Return the difference between allSports and playSports **/
function getSportsNotPlayed(allSports, playSports){
  // OPTIMIZE ???
  return allSports.filter( (anySport) => {
    return !doesPlayerPlay(anySport, playSports);
  });
}

/** Return the sport played by player, searching with sportId **/
async function findPlayerSportById(player, sportId){
  // OPTIMIZE? use a model function?
  const playSports = await player.getSports( { where: { id: sportId } } );
  return (playSports.length == 1) ? playSports[0] : null;
}

router.get('playerSportNew', '/new', async (ctx) => {
  await ctx.render('playerSports/new', {
    player: ctx.state.player,
    sportsNotPlayed: getSportsNotPlayed(ctx.state.sports, ctx.state.playSports),
    submitPlayerSportPath: ctx.router.url('playerSportCreate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('player', { id: ctx.state.player.id })
  });
});

router.post('playerSportCreate', '/', async (ctx) => {
  console.log("CREATING");
  const playSport = await findPlayerSportById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addSport(ctx.request.body.sportId, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("###### validation error when creating player-sport: ", validationError); // DEBUG
    await ctx.render('playerSports/new', {
      player: ctx.state.player,
      sportsNotPlayed: getSportsNotPlayed(ctx.state.sports, ctx.state.playSports),
      errors: validationError.errors,
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
    console.log("###### validation error when updating player-sport: ", validationError); // DEBUG
    await ctx.render('playerSports/edit', {
      player: ctx.state.player,
      playSport,
      errors: validationError.errors,
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
