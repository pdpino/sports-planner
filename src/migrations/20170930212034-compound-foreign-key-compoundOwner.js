module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'compounds',
      'compoundOwnerId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('compounds', 'compoundOwnerId');
  },
};
