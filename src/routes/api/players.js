const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('players', '/', async (ctx) => {
  const players = await ctx.orm.player.findAll();

  // console.log("QUERY: ", ctx.query);

  ctx.body = ctx.jsonSerializer('players', {
    attributes: ['firstName', 'lastName', 'email', 'birthday', 'gender'],
    topLevelLinks: {
      self: ctx.getFullUrl('players'),
    },
    dataLinks: {
      self: (dataset, player) => ctx.getFullUrl('player', player.id),
    },
  }).serialize(players);
});

router.get('player', '/:id', async (ctx) => {
  const player = await ctx.orm.player.scope('api').findById(ctx.params.id);

  console.log("PLAYER: ", player);

  const includeSports = true;
  const includeTeams = true;
  const includeMatches = true;

  ctx.body = ctx.jsonSerializer('players', {
    attributes: ['firstName', 'lastName', 'email', 'photo', 'birthday', 'gender', 'sports', 'teams', 'matches'],
    sports: {
      ref: 'id',
      included: includeSports,
      attributes: ['name'],
      relationshipLinks: {
        related: ctx.getFullUrl('sports'),
      }
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
    matches: {
      ref: 'id',
      included: includeMatches,
      attributes: ['name', 'date', 'isPublic'],
      relationshipLinks: {
        related: ctx.getFullUrl('matches'),
      },
      includedLinks: {
        self: (match) => ctx.getFullUrl('match', match.id),
      },
    },
    topLevelLinks: {
      self: ctx.getFullUrl('player', player.id),
    },
  }).serialize(player);
});

module.exports = router;
