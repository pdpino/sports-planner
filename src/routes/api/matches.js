const KoaRouter = require('koa-router');
const moment = require('moment');
const _ = require('lodash');

const router = new KoaRouter();

const matchParams = ['name', 'isPublic', 'sportId', 'dateYear', 'dateMonth', 'dateDay', 'dateHour', 'dateMinute'];

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.orm.match.findAll();

  ctx.body = ctx.serializeMatches(matches);
});

router.post('matchCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();

  const params = ctx.getParams(matchParams);

  try {
    const match = await ctx.orm.match.playerCreates(ctx.state.currentPlayer, params);

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
