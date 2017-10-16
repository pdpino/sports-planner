module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('fields', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      prices: {
        type: Sequelize.STRING,
      },
      schedule: {
        type: Sequelize.STRING,
      },
      photo: {
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
      compoundId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'compounds',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
    });
  },
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('fields');
  },
};
