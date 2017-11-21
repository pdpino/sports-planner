const KoaRouter = require('koa-router');
const FileStorage = require('../../services/file-storage');

const teamCommentsRouter = require('./teamComments');
const router = new KoaRouter();

router.get('teams', '/', async (ctx) => {
  const teams = await ctx.orm.team.findAll();

  ctx.body = ctx.serializeTeams(teams);
});

router.post('teamCreate', '/', async (ctx) => {
  ctx.requirePlayerLoggedIn();
  // REFACTOR: this is copied in ui-routes
  // Maybe this should be in the player model? to create a team
  // or in team model, and receives the player who created it

  try {
    const team = await ctx.orm.team.create(ctx.request.body.fields);
    ctx.request.body.fields.logo = FileStorage.url("team" + team.id, {})
    FileStorage.upload(ctx.request.body.files.logo, "team" + team.id);
    await team.update(ctx.request.body.fields);
    await ctx.state.currentPlayer.createTeam(team);
    ctx.respondApi('Equipo fue creado con exito');
  } catch (validationError) {
    ctx.body = {
      message: 'No se pudo crear equipo',
      errors: ctx.parseValidationError(validationError),
    }
  }
});

router.get('team', '/:id', async (ctx) => {
  const team = await ctx.findById(ctx.orm.team.scope('api'), ctx.params.id);

  const includePlayers = true;
  const includeMatches = true;
  const includeComments = true;

  ctx.body = ctx.serializeTeam(team, {
    includePlayers,
    includeMatches,
    includeComments,
  })
});

router.use(
  '/:teamId/comments',
  async (ctx, next) => {
    ctx.state.team = await ctx.findById(ctx.orm.team, ctx.params.teamId);
    return next();
  },
  teamCommentsRouter.routes(),
);

module.exports = router;
