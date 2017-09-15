const KoaRouter = require('koa-router');

const index = require('./routes/index');
const sports = require('./routes/sports');
const players = require('./routes/players');
const teams = require('./routes/teams');
const matches = require('./routes/matches');

const router = new KoaRouter();

router.use(
  '/',
  async (ctx, next) => {
    ctx.state.homePath = "/";
    // HACK: ctx.router.url('home') not working (return '//' and page goes to about:blank)
    // path hardcoded
    await next();
  },
  index.routes()
);

router.use('/sports', sports.routes());
router.use(
  '/teams',
  async (ctx, next) => {
    ctx.state.sports = await ctx.orm.sport.findAll();
    await next();
  },
  teams.routes(),
);

router.use('/players', players.routes());
router.use('/matches', matches.routes());

module.exports = router;
