const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('sessionNew', '/new', async (ctx) => {
  ctx.requireNoLogin();

  return ctx.render('session/new', {
    email: '',
    createSessionPath: ctx.router.url('sessionCreate'),
    notice: ctx.flashMessage.notice,
    cancelPath: '/', // HACK: can't use 'home' url
  });
});

router.put('sessionCreate', '/', async (ctx) => {
  ctx.requireNoLogin();

  const { email, password } = ctx.request.body;
  await ctx.login(email, password);
  return ctx.render('session/new', {
    email,
    createSessionPath: ctx.router.url('sessionCreate'),
    error: 'e-mail o contraseña incorrectos',
    cancelPath: '/', // HACK: can't use 'home' path
  });
});

router.delete('sessionDestroy', '/', (ctx) => {
  ctx.session = null;
  ctx.redirect(ctx.router.url('sessionNew'));
});

module.exports = router;
