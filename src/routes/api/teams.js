const KoaRouter = require('koa-router');

const teamCommentsRouter = require('./teamComments');
const router = new KoaRouter();

router.get('teams', '/', async (ctx) => {
  const teams = await ctx.orm.team.findAll();

  ctx.body = ctx.jsonSerializer('teams', {
    attributes: ['name', 'logo'],
    topLevelLinks: {
      self: ctx.getFullUrl('teams'),
    },
    dataLinks: {
      self: (dataset, team) => ctx.getFullUrl('team', team.id),
    },
  }).serialize(teams);
});

router.get('team', '/:id', async (ctx) => {
  const team = await ctx.findById(ctx.orm.team.scope('api'), ctx.params.id);

  const includePlayers = true;
  const includeMatches = true;
  const includeComments = true;

  ctx.body = ctx.jsonSerializer('teams', {
    attributes: ['name', 'logo', 'sport', 'players', 'matches', 'comments'],
    sport: {
      ref: 'id',
      included: true,
      attributes: ['name'],
      relationshipLinks: {
        related: ctx.getFullUrl('sports'),
      }
    },
    players: {
      ref: 'id',
      included: includePlayers,
      attributes: ['firstName', 'lastName', 'gender'],
      relationshipLinks: {
        related: ctx.getFullUrl('players'),
      },
      includedLinks: {
        self: (player) => ctx.getFullUrl('player', player.id),
      },
    },
    matches: {
      ref: 'id',
      included: includeMatches,
      attributes: ['name', 'date'],
      relationshipLinks: {
        related: ctx.getFullUrl('matches'),
      },
      includedLinks: {
        self: (match) => ctx.getFullUrl('match', match.id),
      },
    },
    comments: {
      ref: 'id',
      included: includeComments,
      attributes: ['content', 'createdAt', 'commenter'],
      relationshipLinks: {
        related: ctx.getFullUrl('teamPublicComments', { teamId: team.id }),
      },
    },
    topLevelLinks: {
      self: ctx.getFullUrl('team', team.id),
    },
  }).serialize(team);
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
