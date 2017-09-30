const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    const userOwners = [];
    const nOwners = 10;

    for (let i = 0; i < nOwners; i ++) {
      userOwners.push({
        role: 'owner',
        email: faker.internet.email(),
        password: 'owner', // Hardcode it to login later // Can also use faker.internet.password(),
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
