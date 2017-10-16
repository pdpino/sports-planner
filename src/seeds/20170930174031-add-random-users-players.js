const faker = require('faker');
const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const userPlayers = [];
    const nPlayers = 5;

    for (let i = 0; i < nPlayers; i ++) {
      userPlayers.push({
        role: 'player',
        email: faker.internet.email(),
        password: bcrypt.hashSync('player', 10), // faker.internet.password(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        photo: faker.image.avatar(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('users', userPlayers);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', { role: 'player' });
    // TODO: delete only those with mail different than "@perez.com" (or lastName different than Perez)
  },
};
