const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();

  ctx.body = ctx.jsonSerializer('players', {
    attributes: ['id', 'firstName', 'lastName', 'email', 'birthday', 'gender'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('players')}`,
    },
    dataLinks: {
      self: (dataset, player) => `${ctx.origin}${ctx.router.url('players', player.id)}`,
    },
  }).serialize(players);
});

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();

  ctx.body = ctx.jsonSerializer('players', {
    attributes: ['id', 'firstName', 'lastName', 'email', 'birthday', 'gender'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('players')}`,
    },
    dataLinks: {
      self: (dataset, player) => `${ctx.origin}${ctx.router.url('players', player.id)}`,
    },
  }).serialize(players);
});

module.exports = router;
