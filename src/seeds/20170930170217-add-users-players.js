const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const role = 'player';
    const userPlayers = [
      {
        role,
        email: 'juan@perez.cl',
        password: bcrypt.hashSync('juan', 10),
        firstName: 'Juan',
        lastName: 'Perez',
        photo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role,
        email: 'pedro@perez.cl',
        password: bcrypt.hashSync('pedro', 10),
        firstName: 'Pedro',
        lastName: 'Perez',
        photo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return queryInterface.bulkInsert('users', userPlayers);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', { role: 'player' });
  },
};
