module.exports = {
  up(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    return queryInterface.bulkInsert('sports', [{
      name: 'Futbol',
      isIndividual: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Basquetbol',
      isIndividual: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Tenis',
      isIndividual: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down(queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('sports', null, {});
  },
};
