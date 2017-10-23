module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('scheduleBases', {
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
      hours:{
        type:Sequelize.STRING,
      },
      open:{
        type:Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0,
      },
      day: {
        type: Sequelize.INTEGER,
      },
      month: {
        type: Sequelize.INTEGER,
      },
      year: {
        type: Sequelize.INTEGER,
      },
      weekday: {
        type: Sequelize.INTEGER,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0,
      },
      lastGenerated: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('scheduleBases');
  },
};
