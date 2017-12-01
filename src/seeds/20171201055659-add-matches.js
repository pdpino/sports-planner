module.exports = {
  up(queryInterface, Sequelize) {
    const matches = [{
      name: 'Partido del domingo!',
      isPublic: true,
      sportId: 1, // futbol
      date: '2017-11-26',
      isDone: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('matches', matches);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('matches', null);
  },
};
