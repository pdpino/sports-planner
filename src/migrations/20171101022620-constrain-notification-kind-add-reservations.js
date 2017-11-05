module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove previous constraint
    try{
      await queryInterface.removeConstraint('notifications', 'notification_kind');
    } catch(error){
      // Constraint does not exist
    }

    // HACK: copied from model
    const notificationKinds = [
      'friendshipAsked',
      'friendshipAccepted',
      'addedToTeam',
      'playerInvitedToMatch',
      'playerAcceptedMatch',
      'teamInvitedToMatch',
      'teamAcceptedMatch',
      'playerReserveField',
      'ownerAcceptFieldReservation'
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
