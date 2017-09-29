module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'players',
      'userId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('players', 'userId');
  },
};
