module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('isPlayerInviteds', ['status'], {
      type: 'check',
      name: 'isPlayerInvited_status',
      where: {
        status: ['sent', 'asked', 'rejectedByAdmin', 'rejectedByUser', "accepted"]
        // HACK: roles copied in model.isPlayerInvited
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('isPlayerInviteds', 'isPlayerInvited_status');
  },
};
