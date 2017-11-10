module.exports = function mailInvitationPlayerToTeam(ctx, to, invitationInfo) {
  // invitationInfo:
  // teamName,
  // invitedBy,
  // playerLink,
  // teamLink

  return ctx.sendMail('invite-player-team', { to, subject: 'Invitación a equipo' }, invitationInfo);
};
