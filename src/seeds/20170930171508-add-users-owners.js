const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const role = 'owner';
    const userOwners = [{
        role,
        email: 'emilio91@gmail.com',
        password: bcrypt.hashSync('emilio', 10),
        firstName: 'Emilio',
        lastName: 'Sagredo',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'diegorodriguez@gmail.com',
        password: bcrypt.hashSync('diego', 10),
        firstName: 'Diego',
        lastName: 'Rodriguez',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'esalas@gmail.com',
        password: bcrypt.hashSync('Esteban', 10),
        firstName: 'Esteban',
        lastName: 'Salas',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'tiborchers@uc.cl',
        password: bcrypt.hashSync('tomas', 10),
        firstName: 'Tomas',
        lastName: 'Borchers',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    return queryInterface.bulkInsert('users', userOwners);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', { role: 'owner' });
  },
};
