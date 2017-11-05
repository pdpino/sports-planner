const KoaRouter = require('koa-router');
const Sequelize = require('sequelize');
const moment = require('moment');
const _ = require('lodash');

const invitedPlayersRouter = require('./invitedPlayers');
const invitedTeamsRouter = require('./invitedTeams');
const matchCommentsRouter = require('./matchComments');
const playerReviewsRouter = require('./playerReviews');

const router = new KoaRouter();

/**
 * Filter the parameters passed by the matches/_form.html.ejs (create or edit a match)
 * Assumes that there is a player logged in (ctx.state.currentPlayer is defined)
 */
function getParams(ctx){
  const params = ctx.request.body;
  const filteredParams = _.pick(params, 'name', 'isPublic', 'sportId', 'dateYear', 'dateMonth', 'dateDay', 'dateHour', 'dateMinute');

  // Build date
  filteredParams.date = moment(`${params.dateYear} ${params.dateMonth} ${params.dateDay} ${params.dateHour} ${params.dateMinute}`, "YYYY MM DD H:mm");

  if(!filteredParams.date.isValid()){
    // REVIEW: shouldn't this be in the model?
    filteredParams.date = null;
  }

  // checkbox input passes 'on' when checked and null when not-checked. Parse this to boolean
  filteredParams.isPublic = Boolean(filteredParams.isPublic);

  // Assure name (REVIEW: move this to model? hook? but the model doesnt know the currentPlayer)
  filteredParams.name = filteredParams.name || ctx.orm.match.getDefaultName(ctx.state.currentPlayer);

  return filteredParams;
}

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.getVisibleMatches();

  await ctx.render('matches/index', {
    matches,
    hasCreatePermission: ctx.state.isPlayerLoggedIn,
    newMatchPath: ctx.router.url('matchNew'),
  });
});

router.get('matchNew', '/new', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const match = ctx.orm.match.build();
  match.name = ctx.orm.match.getDefaultName(ctx.state.currentPlayer);

  await ctx.render('matches/new', {
    match,
    sports: ctx.state.allSports,
    submitMatchPath: ctx.router.url('matchCreate'),
    cancelPath: ctx.router.url('matches'),
  });
});

router.get('selectCompound', '/:id/selectCompound', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const match = await ctx.orm.match.findById(ctx.params.id);
  const compounds = await ctx.orm.compound.findAll();

  await ctx.render('matches/selectCompound', {
    match,
    compounds,
    sports: ctx.state.allSports,
    compoundPath: compound => ctx.router.url('selectField',{id:match.id,compoundId: compound.id}),
    cancelPath: ctx.router.url('match',{id:ctx.params.id}),
  });
});

router.get('selectField', '/:id/:compoundId/selectField', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const match = await ctx.orm.match.findById(ctx.params.id);
  const compound = await ctx.orm.compound.findById(ctx.params.compoundId);
  const fields= await compound.getFields();

  await ctx.render('matches/selectField', {
    match,
    compound,
    fields,
    sports: ctx.state.allSports,
    fieldPath: field => ctx.router.url('selectSchedule',{id:match.id,compoundId: compound.id, fieldId: field.id}),
    cancelPath: ctx.router.url('matches'),
  });
});

router.get('selectSchedule', '/:id/:compoundId/:fieldId/selectSchedule', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const match = await ctx.orm.match.findById(ctx.params.id);
  const compound = await ctx.orm.compound.findById(ctx.params.compoundId);
  const fields= await compound.getFields({id:ctx.params.fieldId});
  const field= fields[0];
  const schedules= await field.getSchedules({where:{status:"Available"}});


  await ctx.render('matches/selectSchedule', {
    match,
    compound,
    fields,
    field,
    schedules,
    sports: ctx.state.allSports,
    submitSchedulePath:ctx.router.url('addSchedule',{id:match.id,compoundId: compound.id, fieldId: field.id}),
    cancelPath: ctx.router.url('matches'),
  });
});

router.patch('addSchedule', '/:id/:compoundId/:fieldId/selectSchedule', async (ctx) => {
  ctx.requirePlayerLoggedIn();
  const match = await ctx.findById(ctx.orm.match, ctx.params.id);
  const sport = await ctx.findById(ctx.orm.sport, match.sportId);
  const compound = await ctx.findById(ctx.orm.compound, ctx.params.compoundId);
  const compoundOwner = await ctx.findById(ctx.orm.compoundOwner, compound.compoundOwnerId);
  const fields = await compound.getFields({ id: ctx.params.fieldId });
  const field = fields[0];
  const schedules = await field.getSchedules({ where: { id: ctx.request.body.scheduleId }});
  const schedule = schedules[0];
  ctx.assert(schedule && field, 404);

  // REVIEW: necesario poner id: schedule.id, y otros que se mantienen igual???
  // necesario updatedAt ?
  await schedule.update({
    id: schedule.id,
    price: schedule.price,
    fieldId: schedule.fieldId,
    matchId: match.id,
    hours: schedule.hours,
    date: schedule.date,
    open: schedule.open,
    status: 'Solicited',
    createdAt: schedule.createdAt,
    updatedAt: new Date()
  });

  await ctx.reserveField(ctx.state.currentPlayer, compoundOwner, field);

  ctx.redirect(ctx.router.url('match', match.id));
  // await ctx.render('matches/edit', {
  //   match,
  //   sport: sport.name,
  //   compound,
  //   field,
  //   schedules,
  //   sports: ctx.state.allSports,
  //   submitMatchPath: ctx.router.url('matchUpdate', match.id),
  //   selectCompoundPath: ctx.router.url('selectCompound', {id: ctx.params.id}),
  //   cancelPath: ctx.router.url('matches'),
  // });
});

router.post('matchCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const params = getParams(ctx);

  try {
    const match = await ctx.orm.match.create(params);
    await ctx.state.currentPlayer.addMatch(match.id, {
      through: {
        isAdmin: true,
        status: 'accepted' // HACK: invitation status harcoded
      }
    });
    ctx.redirect(ctx.router.url('match', match.id ));
  } catch (validationError) {
    await ctx.render('matches/new', {
      match: ctx.orm.match.build(params),
      errors: ctx.parseValidationError(validationError),
      sports: ctx.state.allSports,
      submitMatchPath: ctx.router.url('matchCreate'),
      cancelPath: ctx.router.url('matches'),
    });
  }
});

router.get('matchEdit', '/:id/edit', async (ctx) => {
  const match = await ctx.findById(ctx.orm.match, ctx.params.id);
  await ctx.requirePlayerModifyPermission(match);

  await ctx.render('matches/edit', {
    match,
    sports: ctx.state.allSports,
    submitMatchPath: ctx.router.url('matchUpdate', match.id),
    selectCompoundPath: ctx.router.url('selectCompound', {id: ctx.params.id}),
    cancelPath: ctx.router.url('match', { id: ctx.params.id }),
  });
});

router.patch('matchUpdate', '/:id', async (ctx) => {
  const match = await ctx.findById(ctx.orm.match, ctx.params.id);
  await ctx.requirePlayerModifyPermission(match);

  const params = getParams(ctx);
  try {
    await match.update(params);
    ctx.redirect(ctx.router.url('match', { id: match.id }));
  } catch (validationError) {
    await ctx.render('matches/edit', {
      match,
      errors: ctx.parseValidationError(validationError),
      sports: ctx.state.allSports,
      submitMatchPath: ctx.router.url('matchUpdate', match.id),
      cancelPath: ctx.router.url('match', { id: ctx.params.id }),
    });
  }
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.findById(ctx.orm.match.scope('withSport'), ctx.params.id);
  await ctx.requireSeeMatchPermission(match);

  const invitedPlayers = await match.getPlayers();
  const invitedTeams = await match.getTeams();
  const hasModifyPermission = await match.hasModifyPermission(ctx.state.currentPlayer);
  const schedule = await match.getSchedule();
  const field = schedule && await ctx.orm.field.findById(schedule.fieldId);
  const comments = await match.getComments();

  const canComment = await match.isPlayerInvited(ctx.state.currentPlayer);
  // REVIEW: this is being called twice, once in requireSeeMatchPermission and once here

  const reviewsEnabled = match.areReviewsEnabled();
  const pendingReviews = reviewsEnabled &&
    await match.getPendingReviewsFromUser(ctx.state.currentUser);
  const doneReviews = reviewsEnabled &&
    await match.getDoneReviewsFromUser(ctx.state.currentUser);

  const canEnableReviews = await match.canEnableReviews({ hasModifyPermission });

  await ctx.render('matches/show', {
    match,
    hasModifyPermission,
    invitedPlayers,
    invitedTeams,
    schedule,
    field,
    reviewsEnabled,
    canEnableReviews,
    pendingReviews,
    doneReviews,
    enableReviews: ctx.router.url('playerReviewEnable', { matchId: match.id }),
    createPlayerReviewPath: (player) => ctx.router.url('playerReviewCreate', {
      matchId: match.id,
      playerId: player.id,
    }),
    canComment,
    comments,
    createCommentPath: ctx.router.url('matchCommentCreate', { matchId: match.id }),
    deleteCommentPath: (comment) => ctx.router.url('matchCommentDelete', {
      matchId: match.id,
      id: comment.id
    }),
    editMatchPath: ctx.router.url('matchEdit', match.id),
    newInvitedPlayerPath: ctx.router.url('invitedPlayerNew', { matchId: match.id } ),
    newInvitedTeamPath: ctx.router.url('invitedTeamNew', { matchId: match.id } ),
    editInvitedPlayerPath: (player) => ctx.router.url('invitedPlayerEdit', {
      matchId: match.id,
      id: player.id
    }),
    editInvitedTeamPath: (team) => ctx.router.url('invitedTeamEdit', {
      matchId: match.id,
      id: team.id
    }),
    deleteMatchPath: ctx.router.url('matchDelete', match.id),
  });
});

router.delete('matchDelete', '/:id', async (ctx) => {
  const match = await ctx.findById(ctx.orm.match, ctx.params.id);

  await ctx.requirePlayerModifyPermission(match);

  await match.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('matches'));
});

router.use(
  '/:matchId/players',
  async (ctx, next) => {
    ctx.state.match = await ctx.findById(ctx.orm.match, ctx.params.matchId);

    await ctx.requirePlayerModifyPermission(ctx.state.match);

    const friends = await ctx.state.currentPlayer.getAllFriends();
    const invitedPlayers = await ctx.state.match.getPlayers();
    ctx.state.invitablePlayers = ctx.substract(friends, invitedPlayers);
    return next();
  },
  invitedPlayersRouter.routes(),
);

router.use(
  '/:matchId/teams',
  async (ctx, next) => {
    ctx.state.match = await ctx.findById(ctx.orm.match, ctx.params.matchId);

    await ctx.requirePlayerModifyPermission(ctx.state.match);

    const allTeams = await ctx.orm.team.findAll();
    const invitedTeams = await ctx.state.match.getTeams();
    ctx.state.invitableTeams = ctx.substract(allTeams, invitedTeams);
    return next();
  },
  invitedTeamsRouter.routes(),
);

router.use(
  '/:matchId/comments',
  async (ctx, next) => {
    ctx.state.match = await ctx.findById(ctx.orm.match, ctx.params.matchId);
    return next();
  },
  matchCommentsRouter.routes(),
);

router.use(
  '/:matchId/reviews',
  async (ctx, next) => {
    ctx.state.match = await ctx.findById(ctx.orm.match, ctx.params.matchId);

    return next();
  },
  playerReviewsRouter.routes(),
);

module.exports = router;
