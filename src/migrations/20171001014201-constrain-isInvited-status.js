module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('isInviteds', ['status'], {
      type: 'check',
      name: 'isInvited_status',
      where: {
        status: ['sentToUser', 'sentByUser', 'userRejected','rejectedByUser',"accepted"]
        // HACK: roles copied in model.isInvited (and probably routers/isInviteds)
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('isInviteds', 'isInvited_status');
  },
};
