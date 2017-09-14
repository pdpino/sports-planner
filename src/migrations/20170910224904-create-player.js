module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull:false,
        validate: {
          notEmpty:true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull:false,
        validate: {
          notEmpty:true,
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false,
        validate: {
          notEmpty:true,
        },
      },
      age: {
        type: Sequelize.DATEONLY,
      },
      photo: {
        type: Sequelize.STRING,
        allowNull:true,
        defaultValue:null,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
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
    return queryInterface.dropTable('players');
  },
};
