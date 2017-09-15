const KoaRouter = require('koa-router');

const router = new KoaRouter();

/**
 * Boolean if searchedSport is in playSports
 */
function doesPlayerPlay(searchedSport, playSports=[]){
  return playSports.find((sport) => sport.name === searchedSport.name);
}

/**Fix the parameters passed by the player/playerSports.html.ejs (used when editing the sports of a player)*/
function fixUpdateParams(body){
  /* playSports should be a list of sportId 's. If no sport is selected is undefined'*/
  body.playSports = body.playSports || [];
}

/** TODO **/
async function findPlayerSportById(player, sportId){
  const playSports = await player.getSports( { where: { id: sportId } } );
  return (playSports.length == 1) ? playSports[0] : null;
}

router.get('playerSportsNew', '/new', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();
  const playSports = await ctx.state.player.getSports();
  await ctx.render('playerSports/new', {
    // player: ctx.state.player,
    // sports,
    // playSports,
    // doesPlayerPlay,
    // submitPlayerSportsPath: ctx.router.url('playerSportsUpdate', { playerId: ctx.state.player.id }),
    // cancelPath: ctx.router.url('playerShow', ctx.state.player.id)
  });
});

router.get('playerSportEdit', '/:id/edit', async (ctx) => {
  const playSport = await findPlayerSportById(ctx.state.player, ctx.params.id);
  await ctx.render('playerSports/edit', {
    player: ctx.state.player,
    playSport,
    submitPlayerSportPath: ctx.router.url('playerSportUpdate', { playerId: ctx.state.player.id, id: playSport.id }),
    cancelPath: ctx.router.url('playerShow', { id: ctx.state.player.id })
  });
});

router.patch('playerSportUpdate', '/:id', async (ctx) => {
  const playSport = await findPlayerSportById(ctx.state.player, ctx.params.id);
  try {
    await ctx.state.player.addSport(playSport, { through: { position: ctx.request.body.position }});
    ctx.redirect(ctx.router.url('playerShow', { id: ctx.state.player.id }));
  } catch (validationError) {
    console.log("VALIDATION ERROR WHEN UPDATING PLAYER-SPORT: ", validationError);
    await ctx.render('playerSports/edit', {
      player: ctx.state.player,
      playSport,
      errors: validationError.errors,
      submitPlayerSportPath: ctx.router.url('playerSportUpdate', { playerId: ctx.state.player.id, id: playSport.id }),
      cancelPath: ctx.router.url('playerShow', ctx.state.player.id),
    });
  }
});

module.exports = router;
