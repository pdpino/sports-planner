const _ = require('lodash');
const sendInvitationPlayerMail = require('../mailers/invitation-player');
const KoaRouter = require('koa-router');

const router = new KoaRouter();

/** Check if a player is in a list of teamMembers **/
function isTeamMember(searchedPlayer, teamMembers){
  return Boolean(teamMembers.find((player) => player.id == searchedPlayer.id));
}

/** Return the difference between allTeams and playTeams **/
function getInvitablePlayers(allPlayers, teamMembers){
  // OPTIMIZE ? use model functions?
  return allPlayers.filter( (anyPlayer) => {
    return !isTeamMember(anyPlayer, teamMembers);
  });
}

/** Wrapper to find a team member **/
async function findTeamMemberById(team, playerId){
  const teamMembersFound = await team.getPlayers( { where: { id: playerId } } );
  return (teamMembersFound.length == 1) ? teamMembersFound[0] : null;
}

function filterSubmitParams(params){
  const filteredParams = _.pick(params, 'isCaptain', 'playerId');
  /** Parse isCaptain to boolean, html form passes it as 'on' or null **/
  filteredParams.isCaptain = Boolean(filteredParams.isCaptain);
  return filteredParams;
}

router.get('teamMemberNew', '/new', async (ctx) => {
  await ctx.render('teamMembers/new', {
    team: ctx.state.team,
    invitablePlayers: getInvitablePlayers(ctx.state.invitablePlayers, ctx.state.teamMembers),
    submitTeamMemberPath: ctx.router.url('teamMemberCreate', {
      teamId: ctx.state.team.id
    }),
    cancelPath: ctx.router.url('team', ctx.state.team.id)
  });
});

router.post('teamMemberCreate', '/', async (ctx) => {
  const params = filterSubmitParams(ctx.request.body);
  const player = await ctx.state.findById(ctx.orm.player, params.playerId);
  try {
    await ctx.state.team.addPlayer(player, {
      through: {
        isCaptain: params.isCaptain
      }
    });
    await ctx.state.sendNotification(ctx.state.currentPlayer, player, {
      kind: 'addedToTeam',
      entityName: ctx.state.currentPlayer.getName(),
      eventName: ctx.state.team.name,
    });

    sendInvitationPlayerMail(ctx, player.email, {
      eventType: 'Equipo',
      eventName: ctx.state.team.name,
      invitedBy: ctx.state.currentPlayer.getName(),
    });
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    await ctx.render('teamMembers/new', {
      team: ctx.state.team,
      errors: ctx.state.parseValidationError(validationError),
      invitablePlayers: getInvitablePlayers(ctx.state.invitablePlayers, ctx.state.teamMembers),
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
  const params = filterSubmitParams(ctx.request.body);
  const teamMember = await findTeamMemberById(ctx.state.team, ctx.params.id);
  try {
    await ctx.state.team.addPlayer(teamMember, {
      through: {
        isCaptain: params.isCaptain
      }
    });
    ctx.redirect(ctx.router.url('team', { id: ctx.state.team.id }));
  } catch (validationError) {
    await ctx.render('teamMembers/edit', {
      team: ctx.state.team,
      teamMember,
      errors: ctx.state.parseValidationError(validationError),
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
