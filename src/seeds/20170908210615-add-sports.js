module.exports = {
  up(queryInterface, Sequelize) {
    const sports = [{
      name: 'Futbol',
      isIndividual: false,
      logo: '/assets/futbol.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Basquetbol',
      isIndividual: false,
      logo: '/assets/basketbol.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Tenis',
      isIndividual: true,
      logo: '/assets/tenis-ball.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Rugby',
      isIndividual: false,
      logo: '/assets/rugby.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('sports', sports);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('sports', null);
  },
};
