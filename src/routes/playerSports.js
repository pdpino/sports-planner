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

router.patch('playerSportsUpdate', '/', async (ctx) => {
  fixUpdateParams(ctx.request.body);
  console.log("UPDATING: ", ctx.request.body.playSports, ctx.request.body.playSportsPosition)
  try {
    await ctx.state.player.update(ctx.request.body);
    await ctx.state.player.setSports(ctx.request.body.playSports);
    ctx.redirect(ctx.router.url('playerShow', { id: ctx.state.player.id }));
  } catch (validationError) {
    const sports = await ctx.orm.sport.findAll();
    await ctx.render('playerSports/edit', {
      player: ctx.state.player,
      sports,
      playSports: ctx.request.body.playSports,
      doesPlayerPlay,
      errors: validationError.errors,
      submitPlayerSportsPath: ctx.router.url('playerSportsUpdate', { playerId: ctx.state.player.id }),
      cancelPath: ctx.router.url('playerShow', ctx.state.player.id),
    });
  }
});

router.get('playerSportsEdit', '/edit', async (ctx) => {
  const sports = await ctx.orm.sport.findAll();
  const playSports = await ctx.state.player.getSports();
  await ctx.render('playerSports/edit', {
    player: ctx.state.player,
    sports,
    playSports,
    doesPlayerPlay,
    submitPlayerSportsPath: ctx.router.url('playerSportsUpdate', { playerId: ctx.state.player.id }),
    cancelPath: ctx.router.url('playerShow', ctx.state.player.id)
  });
});

module.exports = router;
