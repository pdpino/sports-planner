const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('matches', '/', async (ctx) => {
  const matches = await ctx.orm.match.findAll();

  ctx.body = ctx.jsonSerializer('matches', {
    attributes: ['name', 'date', 'isPublic'],
    topLevelLinks: {
      self: ctx.getFullUrl('matches'),
    },
    dataLinks: {
      self: (dataset, match) => ctx.getFullUrl('match', match.id),
    },
  }).serialize(matches);
});

router.get('match', '/:id', async (ctx) => {
  const match = await ctx.orm.match.scope('api').findById(ctx.params.id);

  const includeTeams = true;
  const includePlayers = true;

  ctx.body = ctx.jsonSerializer('matches', {
    attributes: ['name', 'date', 'isPublic', 'sport', 'players', 'teams'],
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
    teams: {
      ref: 'id',
      included: includeTeams,
      attributes: ['name', 'logo'],
      relationshipLinks: {
        related: ctx.getFullUrl('teams'),
      },
      includedLinks: {
        self: (team) => ctx.getFullUrl('team', team.id),
      },
    },
    topLevelLinks: {
      self: ctx.getFullUrl('match', match.id),
    },
  }).serialize(match);
});

module.exports = router;
