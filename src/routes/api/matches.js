const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.orm.match.findAll();

  ctx.body = ctx.serializeMatches(matches);
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.orm.match.scope('api').findById(ctx.params.id);

  const includePlayers = true;
  const includeTeams = true;

  ctx.body = ctx.serializeMatch(match, {
    includePlayers,
    includeTeams,
  })
});

module.exports = router;
