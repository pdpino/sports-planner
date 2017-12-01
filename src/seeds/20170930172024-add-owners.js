const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    let id = 11;  // HACK: starting id hardcoded
    // 1 is the admin
    // 2-10 are the basic players
    const owners = [{
        // email: 'emilio91@gmail.com',
        phone: '+569 5555 1234',
        userId: id++, // Use id, then increase
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // email: 'diegorodriguez@gmail.com',
        phone: '+569 5211 3434',
        userId: id++, // Use id, then increase
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // email: 'esalas@gmail.com',
        phone: '+569 5512 2283',
        userId: id++, // Use id, then increase
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // email: 'tiborchers@uc.cl',
        phone: '+569 5125 4861',
        userId: id++, // Use id, then increase
        createdAt: new Date(),
        updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('compoundOwners', owners);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('compoundOwners', null);
  },
};
