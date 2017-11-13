module.exports = function mailAskFriend(ctx, to, invitationInfo) {
  // invitationInfo:
  // askedBy,
  // playerLink,

  return ctx.sendMail('ask-friend', { to, subject: 'Solicitud de amistad' }, invitationInfo);
};
