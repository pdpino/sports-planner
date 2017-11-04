const KoaRouter = require('koa-router');
const _ = require('lodash');
const notifications = require('../services/notifications');

const router = new KoaRouter();

/** Wrapper to find a team member **/
async function findTeamMemberById(team, playerId){
  const teamMembersFound = await team.getPlayers( { where: { id: playerId } } );
  return (teamMembersFound.length == 1) ? teamMembersFound[0] : null;
}

function getParams(params){
  const filteredParams = _.pick(params, 'isCaptain', 'playerId');
  /** Parse isCaptain to boolean, html form passes it as 'on' or null **/
  filteredParams.isCaptain = Boolean(filteredParams.isCaptain);
  return filteredParams;
}

router.get('teamMemberNew', '/new', async (ctx) => {
  await ctx.render('teamMembers/new', {
    team: ctx.state.team,
    // invitablePlayers: ctx.state.invitablePlayers, // state is already visible in views
    submitTeamMemberPath: ctx.router.url('teamMemberCreate', {
      teamId: ctx.state.team.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.post('teamMemberCreate', '/', async (ctx) => {
  const params = getParams(ctx.request.body);
  const player = await ctx.findById(ctx.orm.player, params.playerId);
  try {
    await ctx.state.team.invitePlayer(player, params.isCaptain);
    await notifications.invitePlayerToTeam(ctx, ctx.state.currentPlayer, player, ctx.state.team);
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    await ctx.render('teamMembers/new', {
      team: ctx.state.team,
      errors: ctx.parseValidationError(validationError),
      // invitablePlayers: ctx.state.invitablePlayers, // state is already visible in views
      submitTeamMemberPath: ctx.router.url('teamMemberCreate', {
        teamId: ctx.state.team.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.get('teamMemberEdit', '/:id/edit', async (ctx) => {
  const teamMember = await findTeamMemberById(ctx.state.team, ctx.params.id);
  await ctx.render('teamMembers/edit', {
    team: ctx.state.team,
    teamMember,
    submitTeamMemberPath: ctx.router.url('teamMemberUpdate', {
      teamId: ctx.state.team.id,
      id: teamMember.id
    }),
    deleteTeamMemberPath: ctx.router.url('teamMemberDelete', {
      teamId: ctx.state.team.id,
      id: teamMember.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.patch('teamMemberUpdate', '/:id', async (ctx) => {
  const params = getParams(ctx.request.body);
  const teamMember = await findTeamMemberById(ctx.state.team, ctx.params.id);
  try {
    await ctx.state.team.invitePlayer(teamMember, params.isCaptain);
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    await ctx.render('teamMembers/edit', {
      team: ctx.state.team,
      teamMember,
      errors: ctx.parseValidationError(validationError),
      submitTeamMemberPath: ctx.router.url('teamMemberUpdate', {
        teamId: ctx.state.team.id,
        id: teamMember.id
      }),
      deleteTeamMemberPath: ctx.router.url('teamMemberDelete', {
        teamId: ctx.state.team.id,
        id: teamMember.id
      }),
      cancelPath: ctx.router.url('team', ctx.state.team.id)
    });
  }
});

router.delete('teamMemberDelete', '/:id', async (ctx) => {
   await ctx.state.team.removePlayer(ctx.params.id);
   ctx.redirect(ctx.router.url('team', ctx.state.team.id));
 });

module.exports = router;
