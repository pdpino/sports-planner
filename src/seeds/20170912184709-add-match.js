const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    const matches = [];
    for (let i = 0; i < 10; i += 1) {
      matches.push({
        isPublic:faker.random.boolean(),
        date: faker.date.past(),
        createdAt: new Date(),
        updatedAt: new Date(),
        sportId: 1,
      });
    }
    return queryInterface.bulkInsert('matches', matches);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('matches', null);
  },
};
