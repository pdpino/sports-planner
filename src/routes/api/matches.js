const KoaRouter = require('koa-router');
const moment = require('moment');
const _ = require('lodash');

const router = new KoaRouter();

function getParams(ctx){
  // REFACTOR!!!
  // This is copied in ui-router
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
  const matches = await ctx.orm.match.findAll();

  ctx.body = ctx.serializeMatches(matches);
});

router.post('matchCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  // REFACTOR: This router is copied in ui-router
  // There should be a function in match model to create a match from a player

  const params = getParams(ctx);

  try {
    const match = await ctx.orm.match.create(params);
    await ctx.state.currentPlayer.addMatch(match.id, {
      through: {
        isAdmin: true,
        status: 'accepted' // HACK: invitation status harcoded
      }
    });
    ctx.respondApi('Partido fue creado con éxito')
  } catch (validationError) {
    ctx.body = {
      message: 'No se pudo crear partido',
      errors: ctx.parseValidationError(validationError),
    }
  }
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.findById(ctx.orm.match.scope('api'), ctx.params.id);

  const includePlayers = true;
  const includeTeams = true;

  ctx.body = ctx.serializeMatch(match, {
    includePlayers,
    includeTeams,
  })
});

module.exports = router;
