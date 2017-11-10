module.exports = function mailInvitationPlayerToTeam(ctx, to, invitationInfo) {
  // example for info:
  // invitationInfo = {
  //   teamName: 'el partido de juanito',
  //   invitedBy: 'juanito',
  // }

  return ctx.sendMail('invite-player-team', { to, subject: 'Invitación a equipo' }, invitationInfo);
};
