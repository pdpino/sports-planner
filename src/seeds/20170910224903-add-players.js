const faker = require('faker');

module.exports = {

  up(queryInterface, Sequelize) {
    const playersData = [];
    for (let i = 0; i < 10; i += 1) {
      playersData.push({
        name: faker.name.findName(),
        photo: faker.image.avatar(),
        email: faker.internet.email(),
        gender: null,
        password: faker.internet.password(),
        age: faker.date.past(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return queryInterface.bulkInsert('players', playersData);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('players', null, {});
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  },
};
