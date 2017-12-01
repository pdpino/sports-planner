module.exports = {
  up(queryInterface, Sequelize) {
    const teams = [{
      name: 'La naranja mecanica',
      sportId: 1, // futbol
      logo: '/assets/orange-shield.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Los bulls',
      sportId: 2, // basquetbol
      logo: '/assets/bulls.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Joga bonito',
      sportId: 1,
      logo: '/assets/joga-bonito.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'La rojita',
      sportId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      name: 'Los massu',
      sportId: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('teams', teams);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('teams', null);
  },
};
