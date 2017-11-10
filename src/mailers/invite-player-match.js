module.exports = function mailInvitationPlayerToMatch(ctx, to, invitationInfo) {
  // Provide in invitationInfo:
  // matchName,
  // matchDate (already with pretty format),
  // invitedBy

  return ctx.sendMail('invitation-player', { to, subject: 'Invitación a partido' }, invitationInfo);
};
