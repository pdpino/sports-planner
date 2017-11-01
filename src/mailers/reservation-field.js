module.exports = function sendReservationField(ctx, to, invitationInfo) {
  // example for info:
  // invitationInfo = {
  //   playerName,
  //   fieldName,
  // }

  console.log(`MAILERS: (reservation field) mail sent to ${to}, ${invitationInfo}`); // DEBUG

  const subject = 'Nueva reserva de cancha';
  return ctx.sendMail('reservation-field', { to, subject }, invitationInfo);
};
