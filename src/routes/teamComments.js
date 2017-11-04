const _ = require('lodash');
const KoaRouter = require('koa-router');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'isPublic', 'content');
}

async function requirePlayerInTeam(ctx){
  const isInTeam = await ctx.state.team.hasPlayer(ctx.state.currentPlayer);
  ctx.assert(isInTeam, 404);
}

router.post('teamCommentCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const params = getParams(ctx.request.body);
  if (!params.isPublic){
    await requirePlayerInTeam();
  }

  await ctx.state.team.makeComment(ctx.state.currentPlayer, params);
  ctx.redirect(ctx.router.url('team', ctx.state.team.id));
});

router.delete('teamCommentDelete', '/:id', async (ctx) => {
  const comment = await ctx.findById(ctx.orm.teamComment, ctx.params.id);

  ctx.requireModifyPermission(comment.player.userId);

  await comment.destroy();
  ctx.redirect(ctx.router.url('team', ctx.state.team.id));
});

module.exports = router;
