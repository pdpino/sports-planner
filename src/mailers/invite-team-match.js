module.exports = function mailInvitationTeamToMatch(ctx, to, invitationInfo) {
  // invitationInfo:
  // matchName,
  // matchDate (already as prettyTimestamp),
  // teamName,
  // invitedBy,

  return ctx.sendMail('invitation-team', {
    to,
    subject: 'Invitación equipo a partido'
  }, invitationInfo);
};
