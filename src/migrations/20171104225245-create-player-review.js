module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('playerReviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      reviewerId: {
        // primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      reviewedId: {
        // primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      matchId: {
        // primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'matches',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      isPending: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
      },
      content: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable('playerReviews');
  },
};
