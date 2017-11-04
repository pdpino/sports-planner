module.exports = function invitationHelpers(app) {
  // TODO: adecuate message considering if is an invitation for me or I am deciding (see matchesShow and matchesPlayerEdit)
  const statusMessages = {
    'sent': 'No responder aún',
    'asked': 'Esperando confirmación del administrador del partido',
    'rejectedByUser': 'Rechazar invitación',
    'rejectedByAdmin': 'Solicitud rechazada',
    'accepted': 'Aceptar invitación'
  };

  /** Transform an isPlayerInvited status to a message for the user **/
  app.context.invitationToString = function(status){
    return statusMessages[status] || status;
  }

  const userStatusList = ['accepted', 'rejectedByUser', 'sent'];
  const adminStatusList = ['accepted', 'rejectedByAdmin', 'asked'];
  app.context.eligibleStatuses = function (status, isAdmin) {
    if (isAdmin && adminStatusList.includes(status)) {
      return adminStatusList;
    } else if (userStatusList.includes(status)) {
      return userStatusList;
    }
    return null; // Is not in his hands to respond the invitation
  }


};
