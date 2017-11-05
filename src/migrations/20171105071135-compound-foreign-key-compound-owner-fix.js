module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove previous column
    try{
      await queryInterface.removeColumn('compounds', 'compoundOwnerId');
    } catch(error){
      // Column does not exist
    }

    return queryInterface.addColumn(
      'compounds',
      'compoundOwnerId',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'compoundOwners',
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
