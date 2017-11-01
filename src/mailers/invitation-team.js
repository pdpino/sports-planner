module.exports = function sendInvitationTeamMail(ctx, to, invitationInfo) {
  // example for info:
  // invitationInfo = {
  //   eventType: 'Partido',
  //   eventName: 'el partido de juanito',
  //   invitedBy: 'juanito',
  //   teamName: 'mi equipo'
  // }

  console.log(`MAILERS: (team) mail sent to ${to}`); // DEBUG
  const subject = `Invitación a ${invitationInfo.eventType}`;
  return ctx.sendMail('invitation-team', { to, subject }, invitationInfo);
};
