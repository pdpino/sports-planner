module.exports = {
  up(queryInterface, Sequelize) {
    // DEPRECATED: this constraint is deleted in the next migration
    const notificationKinds = [
      'friendshipAsked',
      'friendshipAccepted',
      'addedToTeam',
      'playerInvitedToMatch',
      'playerAcceptedMatch',
      'teamInvitedToMatch',
      'teamAcceptedMatch',
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
