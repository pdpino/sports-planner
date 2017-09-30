const faker = require('faker');
const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const userOwners = [];
    const nOwners = 5;

    for (let i = 0; i < nOwners; i ++) {
      userOwners.push({
        role: 'owner',
        email: faker.internet.email(),
        password: bcrypt.hashSync('owner', 10), // Hardcode it to login later // Can also use faker.internet.password(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        photo: faker.image.avatar(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('users', userOwners);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', { role: 'owner' });
  },
};
