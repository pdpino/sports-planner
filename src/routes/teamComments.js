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

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      ctx.redirect(ctx.router.url('team', ctx.state.team.id));
      break;
    case 'json':
      ctx.body = { };
      break;
    default:
  }
});

router.get('teamCommentsPublic', '/public', async (ctx) => {
  const publicComments = await ctx.state.team.getPublicComments();

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      await ctx.render('comments/index', {
        comments: publicComments,
        deleteCommentPath: (comment) => ctx.router.url('teamCommentDelete', {
          teamId: ctx.state.team.id,
          id: comment.id,
        }),
        isPublic: true,
      });
      break;
    case 'json':
      ctx.body = { comments: publicComments };
      break;
    default:
  }
});

router.get('teamCommentsPrivate', '/private', async (ctx) => {
  await ctx.requirePlayerInTeam(ctx.state.team);

  const privateComments = await ctx.state.team.getPrivateComments();

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      await ctx.render('comments/index', {
        comments: privateComments,
        deleteCommentPath: (comment) => ctx.router.url('teamCommentDelete', {
          teamId: ctx.state.team.id,
          id: comment.id,
        }),
        isPublic: false,
      });
      break;
    case 'json':
      ctx.body = { comments: privateComments };
      break;
    default:
  }
});

router.delete('teamCommentDelete', '/:id', async (ctx) => {
  const comment = await ctx.findById(ctx.orm.teamComment, ctx.params.id);

  ctx.requireModifyPermission(comment.player);

  await comment.destroy();
  ctx.redirect(ctx.router.url('team', ctx.state.team.id));
});

module.exports = router;
