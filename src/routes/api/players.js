const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();

  // console.log("QUERY: ", ctx.query);

  ctx.body = ctx.serializePlayers(players);
});

router.get('player', '/:id', async (ctx) => {
  const player = await ctx.findById(ctx.orm.player.scope('api'), ctx.params.id);

  console.log("PLAYER: ", player);

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
