module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('matches', 'isDone', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('matches', 'isDone');
  },
};
