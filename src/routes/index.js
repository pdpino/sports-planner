const KoaRouter = require('koa-router');
// const pkg = require('../../package.json');

const router = new KoaRouter();

router.get('home', '', async (ctx) => {
  await ctx.render('index', {
    sportsPath: ctx.router.url('sports'),
    teamsPath: ctx.router.url('teams'),
    playersPath: ctx.router.url('players'),
    matchesPath: ctx.router.url('matches'),
  });
});

module.exports = router;
