module.exports = {
  up(queryInterface, Sequelize) {
    const plays = [{
      sportId: 1, // futbol
      playerId: 8, // Alberto
      position: 'Mediocampista',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      sportId: 2, // basketbol
      playerId: 8, // Alberto
      position: 'Pivot',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      sportId: 1, // futbol
      playerId: 2, // pedro
      position: 'Defensa',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      sportId: 1, // futbol
      playerId: 3, // matias
      position: 'Arquero',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      sportId: 1, // futbol
      playerId: 6, // nicolas
      position: 'Defensa',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      sportId: 1, // futbol
      playerId: 9, // lucas
      position: 'Delantero',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('plays', plays);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('plays', null);
  },
};
