module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('isInviteds', {
      playerId: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sports',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      matchId: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      hostId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
      },
      status: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('isInviteds');
  },
};
