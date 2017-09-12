const KoaRouter = require('koa-router');

const hello = require('./routes/hello');
const index = require('./routes/index');
const sports = require('./routes/sports');
<<<<<<< HEAD
const players = require('./routes/players');
=======
const teams = require('./routes/teams');
>>>>>>> 8c251231e6c277486d4cd52bd674e1f78de77633

const router = new KoaRouter();

router.use('/', index.routes());
router.use('/hello', hello.routes());
router.use('/sports', sports.routes());
<<<<<<< HEAD
router.use('/players', players.routes());
=======
// router.use('/teams', teams.routes());

router.use(
  '/teams',
  async (ctx, next) => {
    ctx.state.sports = await ctx.orm.sport.findAll();
    await next();
  },
  teams.routes(),
);
>>>>>>> 8c251231e6c277486d4cd52bd674e1f78de77633

module.exports = router;
