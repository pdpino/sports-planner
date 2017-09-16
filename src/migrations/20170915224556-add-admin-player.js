module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'players',
      'isAdmin',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('players', 'isAdmin');
  },
};
