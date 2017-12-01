const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const admin = {
      role: 'admin',
      email: 'admin@jugamos.com',
      password: bcrypt.hashSync('admin', 10), // really safe password
      firstName: 'Admin',
      lastName: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return queryInterface.bulkInsert('users', [admin]);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null);
  },
};
