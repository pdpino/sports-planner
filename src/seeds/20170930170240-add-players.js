const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    const players = [];
    const nPlayers = 10;

    for (let i = 0; i < nPlayers; i ++) {
      players.push({
        gender: (Math.random < 0.5) ? "masculino" : "femenino",
        birthday: faker.date.past(),
        userId: i + 2,
        // HACK: Assume that users have been created with sequential IDs (starting from 2, 1 is the admin) // If there is no user with that ID it will raise a database error
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return queryInterface.bulkInsert('players', players);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('players', null);
  },
};
