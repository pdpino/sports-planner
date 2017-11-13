const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'content');
}

async function requireCommentPermission(ctx){
  // REFACTOR ?
  const friendshipStatus = (ctx.state.isPlayerLoggedIn
    && await ctx.state.currentPlayer.getFriendshipStatus(ctx.state.player));

  ctx.assert(ctx.orm.player.hasCommentPermission(friendshipStatus), 403);
}

router.post('wallCommentCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  await requireCommentPermission(ctx);

  const params = getParams(ctx.request.body);

  await ctx.state.player.receiveWallComment(ctx.state.currentPlayer, params);

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      ctx.redirect(ctx.router.url('player', ctx.state.player.id));
      break;
    case 'json':
      ctx.body = { };
      break;
    default:
  }
});

router.get('wallComments', '/', async (ctx) => {
  await requireCommentPermission(ctx);

  const comments = await ctx.state.player.getMyWallComments();

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      await ctx.render('comments/index', {
        comments,
        deleteCommentPath: (comment) => ctx.router.url('wallCommentDelete', {
          playerId: ctx.state.player.id,
          id: comment.id,
        }),
      });
      break;
    case 'json':
      ctx.body = { comments: ctx.getDisplayableComments(comments) };
      break;
    default:
  }
});

router.delete('wallCommentDelete', '/:id', async (ctx) => {
  const comment = await ctx.findById(ctx.orm.wallComment, ctx.params.id);

  ctx.requireModifyPermission(comment.commenter);

  await comment.destroy();

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      ctx.redirect(ctx.router.url('player', ctx.state.player.id));
      break;
    case 'json':
      ctx.body = { };
      break;
    default:
  }
});

module.exports = router;
