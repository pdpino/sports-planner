const KoaRouter = require('koa-router');

const teamCommentsRouter = require('./teamComments');
const router = new KoaRouter();

router.get('teams', '/', async (ctx) => {
  const teams = await ctx.orm.team.findAll();

  ctx.body = ctx.serializeTeams(teams);
});

router.get('team', '/:id', async (ctx) => {
  const team = await ctx.findById(ctx.orm.team.scope('api'), ctx.params.id);

  const includePlayers = true;
  const includeMatches = true;
  const includeComments = true;

  ctx.body = ctx.serializeTeam(team, {
    includePlayers,
    includeMatches,
    includeComments,
  })
});

router.use(
  '/:teamId/comments',
  async (ctx, next) => {
    ctx.state.team = await ctx.findById(ctx.orm.team, ctx.params.teamId);
    return next();
  },
  teamCommentsRouter.routes(),
);

module.exports = router;
