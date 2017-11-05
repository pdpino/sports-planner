module.exports = function notificationButtonsHelpers(app) {
  const profileButton = {
    url: (ctx, entityId, eventId) => ctx.router.url('player', entityId),
    method: 'get',
    message: 'Ver perfil'
  };
  const acceptFriendButton = {
    url: (ctx, entityId, eventId) => ctx.router.url('friendAccept', {
      playerId: ctx.state.currentPlayer.id,
      friendId: entityId,
    }),
    method: 'post',
    message: 'Aceptar amistad'
  };

  const teamBaseButton = { method: 'get', message: 'Ver equipo' };
  const teamButtonAsEvent = {
    url: (ctx, entityId, eventId) => ctx.router.url('team', eventId),
    ...teamBaseButton
  };
  const teamButtonAsEntity = {
    url: (ctx, entityId, eventId) => ctx.router.url('team', entityId),
    ...teamBaseButton
  };

  const matchButton = {
    url: (ctx, entityId, eventId) => ctx.router.url('match', eventId),
    method: 'get',
    message: 'Ver partido'
  };

  const fieldBaseButton = { method: 'get', message: 'Ver cancha' };
  const fieldButtonAsEvent = {
    url: (ctx, entityId, eventId) => ctx.router.url('field', eventId),
    ...fieldBaseButton
  };
  const fieldButtonAsEntity = {
    url: (ctx, entityId, eventId) => ctx.router.url('field', entityId),
    ...fieldBaseButton
  };

  const notificationButtons = {
    friendshipAsked: [ acceptFriendButton, profileButton ],
    friendshipAccepted: [ profileButton ],
    addedToTeam: [ teamButtonAsEvent, profileButton ],
    playerInvitedToMatch: [ matchButton, profileButton ],
    playerAcceptedMatch: [ matchButton, profileButton ],
    teamInvitedToMatch: [ matchButton, teamButtonAsEntity ],
    teamAcceptedMatch: [ matchButton, teamButtonAsEntity ],
    playerReserveField: [ fieldButtonAsEvent, profileButton ],
    ownerAcceptFieldReservation: [ matchButton, fieldButtonAsEntity ],
  };

  app.context.getNotificationButtons = function(notification){
    const buttons = notificationButtons[notification.kind];
    buttons.forEach((button) => {
      button.path = button.url(this, notification.entityId, notification.eventId);
    });
    return buttons;
  };

};
