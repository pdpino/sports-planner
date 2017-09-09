const KoaRouter = require('koa-router');

const hello = require('./routes/hello');
const index = require('./routes/index');
const sports = require('./routes/sports');

const router = new KoaRouter();

router.use('/', index.routes());
router.use('/hello', hello.routes());
router.use('/sports', sports.routes());

module.exports = router;
