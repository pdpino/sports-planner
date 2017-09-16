module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('teams', ['name'], {
      type: 'unique',
      name: 'team_unique_name'
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('teams', 'team_unique_name');
  },
};
