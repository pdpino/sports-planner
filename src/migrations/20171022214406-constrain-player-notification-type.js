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
    return queryInterface.addConstraint('playerNotifications', ['kind'], {
      type: 'check',
      name: 'playerNotification_kind',
      where: {
        kind: notificationKinds,
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('playerNotifications', 'playerNotification_kind');
  },
};
