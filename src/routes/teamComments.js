const _ = require('lodash');
const KoaRouter = require('koa-router');

const router = new KoaRouter();

function getParams(params){
  return _.pick(params, 'isPublic', 'content');
}

router.post('teamCommentCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const params = getParams(ctx.request.body);
  await ctx.state.team.makeComment(ctx.state.currentPlayer, params);
  ctx.redirect(ctx.router.url('team', ctx.state.team.id));
});

// router.patch('teamCommentUpdate', '/:id', async (ctx) => {
//   // TODO
// });

router.delete('teamCommentDelete', '/:id', async (ctx) => {
  // ctx.requirePlayerLoggedIn(ctx);
  // TODO: require correct user

  await ctx.state.team.removeComment(ctx.params.id);
  ctx.redirect(ctx.router.url('team', ctx.state.team.id));
});

module.exports = router;
