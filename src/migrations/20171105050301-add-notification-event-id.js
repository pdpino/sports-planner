module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('notifications', 'eventId', {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('notifications', 'eventId');
  },
};
