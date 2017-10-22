module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fieldId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fields',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      matchId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'matches',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      price: {
        type: Sequelize.INTEGER,
      },
      hours: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATE,
      },
      open:{
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
    return queryInterface.dropTable('schedules');
  },
};
