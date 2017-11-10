module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'compounds',
      'compoundOwnerId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // ERROR: should be compoundOwners, is fixed in a following migration
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('compounds', 'compoundOwnerId');
    } catch (error) {
      // Column already deleted
    }
  },
};
