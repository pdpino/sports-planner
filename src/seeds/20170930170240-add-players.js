const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    let id = 2; // HACK: starting id hardcoded
      // 1 is admin
    const players = [
      {
        // Juan perez
        gender: "masculino",
        birthday: faker.date.past(),
        userId: id++, // Use id, then increase
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // Pedro perez
        gender: "masculino",
        birthday: faker.date.past(),
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('players', players);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('players', null);
  },
};
