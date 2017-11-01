const _ = require('lodash');
const notifications = require('../services/notifications');
const moment = require('moment');
const KoaRouter = require('koa-router');
const Sequelize = require('sequelize');

const invitedPlayersRouter = require('./invitedPlayers');
const invitedTeamsRouter = require('./invitedTeams');
const router = new KoaRouter();

/**
 * Filter the parameters passed by the matches/_form.html.ejs (create or edit a match)
 * Assumes that there is a player logged in (ctx.state.currentPlayer is defined)
 */
function getMatchParams(ctx){
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

async function requireSeeMatchPermission(ctx, match){
  const hasSeePermission = match.isPublic || (ctx.state.currentPlayer &&
    await match.hasPlayer(ctx.state.currentPlayer, {
      // HACK: through object copied in multiple places
      through: {
        where: {
          status: { [Sequelize.Op.not]: 'rejectedByAdmin' }
          // HACK: invitation status hardcoded
        }
      }
    }));
  ctx.assert(hasSeePermission, 403, "No tienes permisos");
}

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.state.getVisibleMatches(ctx);

  await ctx.render('matches/index', {
    matches,
    sports: ctx.state.sports,
    hasCreatePermission: ctx.state.isPlayerLoggedIn,
    matchPath: match => ctx.router.url('match', { id: match.id }),
    newMatchPath: ctx.router.url('matchNew'),
  });
});

router.get('matchNew', '/new', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const match = ctx.orm.match.build();
  match.name = ctx.orm.match.getDefaultName(ctx.state.currentPlayer);

  await ctx.render('matches/new', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchCreate'),
    cancelPath: ctx.router.url('matches'),
  });
});

router.get('selectCompound', '/:id/selectCompound', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const match = await ctx.orm.match.findById(ctx.params.id);
  const compounds = await ctx.orm.compound.findAll();

  await ctx.render('matches/selectCompound', {
    match,
    compounds,
    sports: ctx.state.sports,
    compoundPath: compound => ctx.router.url('selectField',{id:match.id,compoundId: compound.id}),
    cancelPath: ctx.router.url('match',{id:ctx.params.id}),
  });
});

router.get('selectField', '/:id/:compoundId/selectField', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const match = await ctx.orm.match.findById(ctx.params.id);
  const compound = await ctx.orm.compound.findById(ctx.params.compoundId);
  const fields= await compound.getFields();

  await ctx.render('matches/selectField', {
    match,
    compound,
    fields,
    sports: ctx.state.sports,
    fieldPath: field => ctx.router.url('selectSchedule',{id:match.id,compoundId: compound.id, fieldId: field.id}),
    cancelPath: ctx.router.url('matches'),
  });
});

router.get('selectSchedule', '/:id/:compoundId/:fieldId/selectSchedule', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

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
    sports: ctx.state.sports,
    submitSchedulePath:ctx.router.url('addSchedule',{id:match.id,compoundId: compound.id, fieldId: field.id}),
    cancelPath: ctx.router.url('matches'),
  });
});

router.patch('addSchedule', '/:id/:compoundId/:fieldId/selectSchedule', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);
  const match = await ctx.state.findById(ctx.orm.match, ctx.params.id);
  const sport = await ctx.state.findById(ctx.orm.sport, match.sportId);
  const compound = await ctx.state.findById(ctx.orm.compound, ctx.params.compoundId);
  const compoundOwner = await ctx.state.findById(ctx.orm.compoundOwner, compound.compoundOwnerId);
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

  await notifications.reserveField(ctx, ctx.state.currentPlayer, compoundOwner, field);

  ctx.redirect(ctx.router.url('match', match.id));
  // await ctx.render('matches/edit', {
  //   match,
  //   sport: sport.name,
  //   compound,
  //   field,
  //   schedules,
  //   sports: ctx.state.sports,
  //   submitMatchPath: ctx.router.url('matchUpdate', match.id),
  //   selectCompoundPath: ctx.router.url('selectCompound', {id: ctx.params.id}),
  //   cancelPath: ctx.router.url('matches'),
  // });
});

router.post('matchCreate', '/', async (ctx) => {
  ctx.state.requirePlayerLoggedIn(ctx);

  const params = getMatchParams(ctx);

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
      errors: ctx.state.parseValidationError(validationError),
      sports: ctx.state.sports,
      submitMatchPath: ctx.router.url('matchCreate'),
      cancelPath: ctx.router.url('matches'),
    });
  }
});

router.get('matchEdit', '/:id/edit', async (ctx) => {
  const match = await ctx.state.findById(ctx.orm.match, ctx.params.id);
  await ctx.state.requirePlayerModifyPermission(ctx, match);

  await ctx.render('matches/edit', {
    match,
    sports: ctx.state.sports,
    submitMatchPath: ctx.router.url('matchUpdate', match.id),
    selectCompoundPath: ctx.router.url('selectCompound', {id: ctx.params.id}),
    cancelPath: ctx.router.url('match', { id: ctx.params.id }),
  });
});

router.patch('matchUpdate', '/:id', async (ctx) => {
  const match = await ctx.state.findById(ctx.orm.match, ctx.params.id);
  await ctx.state.requirePlayerModifyPermission(ctx, match);

  const params = getMatchParams(ctx);
  try {
    await match.update(params);
    ctx.redirect(ctx.router.url('match', { id: match.id }));
  } catch (validationError) {
    await ctx.render('matches/edit', {
      match,
      errors: ctx.state.parseValidationError(validationError),
      sports: ctx.state.sports,
      submitMatchPath: ctx.router.url('matchUpdate', match.id),
      cancelPath: ctx.router.url('match', { id: ctx.params.id }),
    });
  }
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.state.findById(ctx.orm.match, ctx.params.id);
  await requireSeeMatchPermission(ctx, match);

  const sport = await ctx.state.findById(ctx.orm.sport, match.sportId);
  const invitedPlayers = await match.getPlayers();
  const invitedTeams = await match.getTeams();
  const hasModifyPermission = await match.hasModifyPermission(ctx.state.currentPlayer);
  const schedule = await match.getSchedule();
  const field = schedule && await ctx.orm.field.findById(schedule.fieldId);

  await ctx.render('matches/show', {
    match,
    invitedPlayers,
    hasModifyPermission,
    sport: sport.name,
    invitedTeams,
    schedule,
    field,
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
  const match = await ctx.state.findById(ctx.orm.match, ctx.params.id);

  await ctx.state.requirePlayerModifyPermission(ctx, match);

  await match.destroy(); // {force: true});
  ctx.redirect(ctx.router.url('matches'));
});

router.use(
  '/:matchId/players',
  async (ctx, next) => {
    ctx.state.match = await ctx.state.findById(ctx.orm.match, ctx.params.matchId);

    await ctx.state.requirePlayerModifyPermission(ctx, ctx.state.match);

    ctx.state.invitablePlayers = await ctx.state.currentPlayer.getAllFriends();
    ctx.state.invitedPlayers = await ctx.state.match.getPlayers();
    await next();
  },
  invitedPlayersRouter.routes(),
);

router.use(
  '/:matchId/teams',
  async (ctx, next) => {
    ctx.state.match = await ctx.state.findById(ctx.orm.match, ctx.params.matchId);

    await ctx.state.requirePlayerModifyPermission(ctx, ctx.state.match);

    ctx.state.teams = await ctx.orm.team.findAll();
    ctx.state.invitedTeams = await ctx.state.match.getTeams();
    await next();
  },
  invitedTeamsRouter.routes(),
);

module.exports = router;
