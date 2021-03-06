module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('notifications', 'entityId', {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('notifications', 'entityId');
  },
};
