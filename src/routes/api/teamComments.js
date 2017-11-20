const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('teamPublicComments', '/public', async (ctx) => {
  const publicComments = await ctx.state.team.getPublicComments();

  ctx.body = ctx.jsonSerializer('teamComments', {
    attributes: ['content', 'commenter', 'player', 'createdAt'],
    player: {
      ref: 'id',
      attributes: ['firstName', 'lastName', 'gender']
    },
    topLevelLinks: {
      self: ctx.getFullUrl('teamPublicComments', ctx.state.team.id),
    },
    dataLinks: {
      self: (dataset, comment) => ctx.getFullUrl('teamPublicComment', {
        id: comment.id,
        teamId: ctx.state.team.id
      }),
    },
  }).serialize(publicComments);
});

router.get('teamPublicComment', '/public/:id', async (ctx) => {
  ctx.body = { status: 'TODO' };
});

module.exports = router;
