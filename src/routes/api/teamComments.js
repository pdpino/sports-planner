const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('teamPublicComments', '/public', async (ctx) => {
  const publicComments = await ctx.state.team.getPublicComments();

  ctx.body = ctx.serializeTeamComments(publicComments, ctx.state.team, {
    isPublic: true,
    includePlayers: true,
  });
});

router.get('teamPublicComment', '/public/:id', async (ctx) => {
  ctx.returnTODO();
});

module.exports = router;
