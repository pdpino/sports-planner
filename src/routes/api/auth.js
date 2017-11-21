const KoaRouter = require('koa-router');
const _ = require('lodash');
const jwtgenerator = require('jsonwebtoken');

const router = new KoaRouter();

function getParams(ctx){
  let paramsObject;

  if (ctx.request.headers['content-type'].startsWith('multipart')) {
    paramsObject = ctx.request.body.fields;
  } else {
    paramsObject = ctx.request.body;
  }

  return _.pick(paramsObject, 'email', 'password');
}

router.post('auth', '/', async (ctx) => {
  const { email, password } = getParams(ctx);
  const user = await ctx.orm.user.find({ where: { email } });
  if (user && await user.checkPassword(password)) {
    const token = await new Promise((resolve, reject) => {
      jwtgenerator.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
      );
    });
    ctx.body = { token };
  } else {
    ctx.throw(401, 'Wrong e-mail or password');
  }
});

module.exports = router;
