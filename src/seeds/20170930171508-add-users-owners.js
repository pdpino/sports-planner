const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const role = 'owner';
    const userOwners = [
      {
        role,
        email: 'tomas@perez.cl',
        password: bcrypt.hashSync('tomas', 10),
        firstName: 'Tomas',
        lastName: 'Perez',
        photo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role,
        email: 'matias@perez.cl',
        password: bcrypt.hashSync('matias', 10),
        firstName: 'Matias',
        lastName: 'Perez',
        photo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('users', userOwners);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', { role: 'owner' });
  },
};
