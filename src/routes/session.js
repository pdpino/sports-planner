const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('sessionNew', '/new', async ctx =>
  ctx.render('session/new', {
    email: '',
    createSessionPath: ctx.router.url('sessionCreate'),
    notice: ctx.flashMessage.notice,
    cancelPath: '/', // HACK: can't use 'home' path
  }),
);

router.put('sessionCreate', '/', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.user.find({ where: { email } });
  const isPasswordCorrect = await user.checkPassword(password);
  if (isPasswordCorrect) {
    ctx.session.userId = user.id;
    return ctx.redirect('/'); // HACK: can't use 'home' path
  }
  return ctx.render('session/new', {
    email,
    createSessionPath: ctx.router.url('sessionCreate'),
    error: 'e-mail o contraseña incorrectos',
  });
});

router.delete('sessionDestroy', '/', (ctx) => {
  ctx.session = null;
  ctx.redirect(ctx.router.url('sessionNew'));
});

module.exports = router;
