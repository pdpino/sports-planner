const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    const matchesData = [];
    for (let i = 0; i < 10; i += 1) {
      matchesData.push({
        isPublic:faker.random.boolean(),
        date: faker.date.soon(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return queryInterface.bulkInsert('players', playersData);
  },

  down(queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  },
};
