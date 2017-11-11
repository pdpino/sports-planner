const KoaRouter = require('koa-router');
// const pkg = require('../../package.json');

const router = new KoaRouter();

router.get('index', 'index', (ctx) => {
  return ctx.render('index', { });
});

router.get('home', '', async (ctx) => {
  // Provide function for views
  ctx.state.getNotificationButtons = ctx.getNotificationButtons.bind(ctx);

  if (ctx.state.isPlayerLoggedIn){
    const notifications = await ctx.state.currentUser.getReceivedNotifications();
    const mySports = await ctx.state.currentPlayer.getSports();
    const myTeams = await ctx.state.currentPlayer.getTeams();
    const myMatches = await ctx.state.currentPlayer.getMatches();
    const reviewsAverage = await ctx.state.currentPlayer.getReviewsAverage();

    await ctx.render('home/player', {
      notifications,
      mySports,
      myTeams,
      myMatches,
      reviewsAverage,
      newTeamPath: ctx.router.url('teamNew'),
      deletePlayerTeamPath: (team) => ctx.router.url('playerTeamDelete', {
        playerId: ctx.state.currentPlayer.id,
        id: team.id
      }),
      newPlayerMatchPath: ctx.router.url('playerMatchNew', { playerId: ctx.state.currentPlayer.id } ),
      editPlayerMatchPath: (match) => ctx.router.url('playerMatchEdit', {
        playerId: ctx.state.currentPlayer.id,
        id: match.id
      }),
      newPlayerSportPath: ctx.router.url('playerSportNew', { playerId: ctx.state.currentPlayer.id } ),
      editPlayerSportPath: (sport) => ctx.router.url('playerSportEdit', {
        playerId: ctx.state.currentPlayer.id,
        id: sport.id
      }),
    });
  } else if (ctx.state.isOwnerLoggedIn) {
    const notifications = await ctx.state.currentUser.getReceivedNotifications();
    await ctx.render('home/compoundOwner', {
      notifications,
    });
  } else {
    return ctx.redirect(ctx.router.url('index'));
  }
});

module.exports = router;
