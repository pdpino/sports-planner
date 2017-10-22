module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('matches', 'name', {
      allowNull: false,
      defaultValue: '',
      type: Sequelize.STRING
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('matches', 'name');
  },
};
