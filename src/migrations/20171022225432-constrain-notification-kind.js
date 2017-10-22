module.exports = {
  up(queryInterface, Sequelize) {
    // HACK: copied from model
    const notificationKinds = [
      'friendshipAsked',
      'friendshipAccepted',
      'addedToTeam',
      'playerInvitedToMatch',
      'playerAcceptedInMatch',
      'teamInvitedToMatch',
      'teamAcceptedInMatch',
    ];
    return queryInterface.addConstraint('notifications', ['kind'], {
      type: 'check',
      name: 'notification_kind',
      where: {
        kind: notificationKinds,
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('notifications', 'notification_kind');
  },
};
