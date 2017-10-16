const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    let id = 4;  // HACK: starting id hardcoded
      // 1 is the admin
      // 2-3 are the basic players
    const owners = [
      {
        // Tomas perez
        phone: faker.phone.phoneNumber(),
        userId: id++, // Use id, then increase
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // Matias perez
        phone: faker.phone.phoneNumber(),
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('compoundOwners', owners);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('compoundOwners', null);
  },
};
