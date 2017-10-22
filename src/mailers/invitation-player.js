module.exports = function sendInvitationPlayerMail(ctx, to, invitationInfo) {
  // example for info:
  // invitationInfo = {
  //   eventType: 'Partido',
  //   eventName: 'el partido de juanito',
  //   invitedBy: 'juanito',
  // }

  console.log(`MAILERS: (player) mail sent to ${to}`); // DEBUG
  const subject = `Invitación a ${invitationInfo.eventType}`
  return ctx.sendMail('invitation-player', { to, subject }, invitationInfo);
};
