module.exports = function mailInvitationPlayerToTeam(ctx, to, invitationInfo) {
  // invitationInfo:
  // teamName,
  // invitedBy,

  return ctx.sendMail('invite-player-team', { to, subject: 'Invitación a equipo' }, invitationInfo);
};
