const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    const owners = [];
    const nOwners = 10;
    const startingId = 12;
      // 1 is the admin
      // 1-11 are the players

    for (let i = 0; i < nOwners; i ++) {
      owners.push({
        phone: faker.phone.phoneNumber(),
        userId: i + startingId,
        // HACK: Assume that users have been created with sequential IDs // If there is no user with that ID it will raise a database error
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('compoundOwners', owners);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('compoundOwners', null);
  },
};
