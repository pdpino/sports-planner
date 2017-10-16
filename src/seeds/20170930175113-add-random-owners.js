const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    const owners = [];
    const nOwners = 5;
    const startingId = 11; // HACK: Hardcode starting ID
      // 1 is admin
      // 2-3 are basic players
      // 4-5 are basic owners
      // 6-10 are random players

    for (let i = 0; i < nOwners; i ++) {
      owners.push({
        phone: faker.phone.phoneNumber(),
        userId: i + startingId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('compoundOwners', owners);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('compoundOwners', null);
    // TODO: delete only those with id greater than startingId
  },
};
