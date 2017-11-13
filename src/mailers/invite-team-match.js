module.exports = function mailInvitationTeamToMatch(ctx, to, invitationInfo) {
  // invitationInfo:
  // matchName,
  // matchDate (already as prettyTimestamp),
  // teamName,
  // invitedBy,
  // playerLink,
  // teamLink,
  // matchLink,

  return ctx.sendMail('invite-team-match', {
    to,
    subject: 'Invitación equipo a partido'
  }, invitationInfo);
};
