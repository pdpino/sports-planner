module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('isPlayerInviteds', ['status'], {
      type: 'check',
      name: 'isPlayerInvited_status',
      where: {
        status: ['sentToUser', 'sentByUser', 'userRejected', 'rejectedByUser', "accepted"]
        // HACK: roles copied in model.isPlayerInvited (and probably routers/isPlayerInviteds)
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('isPlayerInviteds', 'isPlayerInvited_status');
  },
};
