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
    const myTeams = await ctx.state.currentPlayer.getTeamsWithSport();
    const myPastMatches = await ctx.state.currentPlayer.getPastMatches();
    const myInviteMatches = await ctx.state.currentPlayer.getInviteMatches();
    const myConfirmedMatches = await ctx.state.currentPlayer.getConfirmedMatches();
    const reviewsAverage = await ctx.state.currentPlayer.getReviewsAverage();

    await ctx.render('home/player', {
      notifications,
      mySports,
      myTeams,
      myPastMatches,
      myInviteMatches,
      myConfirmedMatches,
      reviewsAverage,
      newMatchPath: ctx.router.url('matchNew'),
      newTeamPath: ctx.router.url('teamNew'),
      deletePlayerTeamPath: (team) => ctx.router.url('playerTeamDelete', {
        playerId: ctx.state.currentPlayer.id,
        id: team.id
      }),
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
