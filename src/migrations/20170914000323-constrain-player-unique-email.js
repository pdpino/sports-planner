module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('players', ['email'], {
      type: 'unique',
      name: 'player_unique_email'
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('players', 'player_unique_email');
  },
};
