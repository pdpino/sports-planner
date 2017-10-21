module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('isTeamInviteds', ['status'], {
      type: 'check',
      name: 'isTeamInvited_status',
      where: {
        status: ['sent', 'asked', 'rejectedByAdmin', 'rejectedByUser', 'accepted']
        // HACK: roles copied in model.isTeamInvited
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('isTeamInviteds', 'isTeamInvited_status');
  },
};
