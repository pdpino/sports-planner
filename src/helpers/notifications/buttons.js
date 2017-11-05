const _ = require('lodash');

module.exports = function notificationButtonsHelpers(app) {
  const profileButton = {
    url: (ctx, entityId, eventId) => ctx.router.url('player', entityId),
    method: 'get',
    message: 'Ver perfil',
    prescindEvent: true,
  };
  const acceptFriendButton = {
    url: (ctx, entityId, eventId) => ctx.router.url('friendAccept', {
      playerId: ctx.state.currentPlayer.id,
      friendId: entityId,
    }),
    method: 'patch',
    message: 'Aceptar amistad',
    ignoreIfRead: true,
    prescindEvent: true,
  };

  const teamBaseButton = { method: 'get', message: 'Ver equipo' };
  const teamButtonAsEvent = {
    url: (ctx, entityId, eventId) => ctx.router.url('team', eventId),
    ...teamBaseButton,
    prescindEntity: true,
  };
  const teamButtonAsEntity = {
    url: (ctx, entityId, eventId) => ctx.router.url('team', entityId),
    ...teamBaseButton,
    prescindEvent: true,
  };

  const matchButton = {
    url: (ctx, entityId, eventId) => ctx.router.url('match', eventId),
    method: 'get',
    message: 'Ver partido',
    prescindEntity: true,
  };

  // FIXME: fieldURL needs both fieldId and compoundId, and is not being saved
  const fieldBaseButton = { method: 'get', message: 'Ver cancha' };
  const fieldButtonAsEvent = {
    url: (ctx, entityId, eventId) => '/', // ctx.router.url('field', eventId),
    ...fieldBaseButton,
    prescindEntity: true,
  };
  const fieldButtonAsEntity = {
    url: (ctx, entityId, eventId) => '/', // ctx.router.url('field', entityId),
    ...fieldBaseButton,
    prescindEvent: true,
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
    let buttons = notificationButtons[notification.kind];
    buttons.forEach((button) => {
      button.ignore = notification.wasRead && button.ignoreIfRead;

      if ((!notification.entityId && !button.prescindEntity) ||
          (!notification.eventId && !button.prescindEvent)){
        // entity not present and can't prescind it for the url
        // OR event not present and can't prescind it
        button.ignore = true;
        return;
      }

      button.path = button.url(this, notification.entityId, notification.eventId);
    });
    buttons = _.filter(buttons, (button) => !button.ignore);
    return buttons;
  };

};
