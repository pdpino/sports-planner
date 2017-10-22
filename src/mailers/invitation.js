module.exports = function sendInvitationEmail(ctx, to, invitationInfo) {
  // example for info:
  // invitationInfo = {
  //   eventType: 'Partido',
  //   eventName: 'el partido de juanito',
  //   invitedBy: 'juanito',
  // }

  console.log(`MAILERS: mail sent to ${to}`); // DEBUG
  const subject = `Invitación a ${invitationInfo.eventType}`
  return ctx.sendMail('invitation', { to, subject }, invitationInfo);
};
