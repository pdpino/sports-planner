module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('playerNotifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      wasRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      kind: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      playerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('playerNotifications');
  },
};
