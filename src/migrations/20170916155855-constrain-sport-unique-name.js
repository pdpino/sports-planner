module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('sports', ['name'], {
      type: 'unique',
      name: 'sport_unique_name'
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('sports', 'sport_unique_name');
  },
};
