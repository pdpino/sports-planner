module.exports = {
  up(queryInterface, Sequelize) {
    const sports = [{
      name: 'Futbol',
      isIndividual: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Basquetbol',
      isIndividual: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Tenis',
      isIndividual: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Golf',
      isIndividual: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Ciclismo',
      isIndividual: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Natación',
      isIndividual: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('sports', sports);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('sports', null);
  },
};
