module.exports = function mailFieldReservation(ctx, to, invitationInfo) {
  // invitationInfo:
  // playerName,
  // fieldName,
  // compoundName,
  // playerLink,
  // fieldLink,
  // compoundLink,

  return ctx.sendMail('reserve-field', {
    to,
    subject: 'Nueva reserva de cancha'
  }, invitationInfo);
};
