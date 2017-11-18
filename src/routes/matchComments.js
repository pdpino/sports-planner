const KoaRouter = require('koa-router');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'content');
}

async function requireCommentPermission(ctx){
  // REFACTOR ?
  const hasCommentPermission = await ctx.state.match.isPlayerInvited(ctx.state.currentPlayer);
  ctx.assert(hasCommentPermission, 403);
}


router.post('matchCommentCreate', '/', async (ctx) => {
  await requireCommentPermission(ctx);

  const params = getParams(ctx.request.body);
  await ctx.state.match.makeComment(ctx.state.currentPlayer, params);

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      ctx.redirect(ctx.router.url('match', ctx.state.match.id));
      break;
    case 'json':
      ctx.body = { };
      break;
    default:
  }
});

router.get('matchComments', '/', async (ctx) => {
  await requireCommentPermission(ctx);
  
  const comments = await ctx.state.match.getComments();

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      await ctx.render('comments/index', {
        comments,
        deleteCommentPath: (comment) => ctx.router.url('matchCommentDelete', {
          matchId: ctx.state.match.id,
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


router.delete('matchCommentDelete', '/:id', async (ctx) => {
  const comment = await ctx.findById(ctx.orm.matchComment, ctx.params.id);
  ctx.requireModifyPermission(comment.player);

  await comment.destroy();

  switch (ctx.accepts('html', 'json')) {
    case 'html':
      ctx.redirect(ctx.router.url('match', ctx.state.match.id));
      break;
    case 'json':
      ctx.body = { };
      break;
    default:
  }
});

module.exports = router;
