const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    const players = [];
    const nPlayers = 5;
    const startingId = 6; // HACK: Hardcode starting ID
      // 1 is admin
      // 2-3 are basic players
      // 4-5 are basic owners

    for (let i = 0; i < nPlayers; i ++) {
      players.push({
        gender: (Math.random() < 0.5) ? 'masculino' : 'femenino',
        birthday: faker.date.past(),
        userId: i + startingId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('players', players);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('players', null);
    // TODO: delete only those with id greater than startingId
  },
};
