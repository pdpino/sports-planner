const KoaRouter = require('koa-router');
const api = require('./routes/api');

const router = new KoaRouter();

router.use('/api', api.routes());

module.exports = router;
