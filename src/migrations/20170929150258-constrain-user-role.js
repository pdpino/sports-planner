module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('users', ['role'], {
      type: 'check',
      name: 'user_roles',
      where: {
        role: ['admin', 'player', 'owner']
        // HACK: roles copied in model.user (and probably routers/users)
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('users', 'user_roles');
  },
};
