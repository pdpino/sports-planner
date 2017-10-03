module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
      },
      sportId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sports',
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
    return queryInterface.dropTable('matches');
  },
};
