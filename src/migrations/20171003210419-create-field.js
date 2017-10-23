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
      openingHour: {
        type:Sequelize.STRING,
        allowNull:false,
        defaultValue:"00:00",
      },
      closingHour: {
        type:Sequelize.STRING,
        allowNull:false,
        defaultValue:"23:59",
      },
      modules: {
        type: Sequelize.INTEGER,
        defaultValue:1,
        allowNull:false,
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
