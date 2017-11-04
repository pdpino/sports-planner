const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'isPublic', 'content');
}

router.post('teamCommentCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const params = getParams(ctx.request.body);
  if (!params.isPublic){
    await ctx.requirePlayerInTeam(ctx.state.team);
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
