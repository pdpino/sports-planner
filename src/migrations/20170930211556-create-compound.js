module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('compounds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      localemail: {
        type: Sequelize.STRING,
      },
      photo: {
        type: Sequelize.STRING,
        allowNull:true,
        defaultValue:true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      address: {
        type: Sequelize.STRING,
      },
      localphone: {
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
    return queryInterface.dropTable('compounds');
  },
};
