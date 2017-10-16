const KoaRouter = require('koa-router');
// const pkg = require('../../package.json');

const router = new KoaRouter();

router.get('home', '', async (ctx) => {
  await ctx.render('index', {});
});

module.exports = router;
