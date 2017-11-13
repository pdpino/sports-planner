module.exports = function mailInvitationPlayerToMatch(ctx, to, invitationInfo) {
  // invitationInfo:
  // matchName,
  // matchDate (already with pretty format),
  // invitedBy,
  // playerLink,
  // matchLink

  return ctx.sendMail('invite-player-match', { to, subject: 'Invitación a partido' }, invitationInfo);
};
