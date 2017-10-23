const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.delete('playerTeamDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeTeam(ctx.params.id);
   ctx.redirect(ctx.router.url('player', ctx.state.player.id));
 });

module.exports = router;
