const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const role = 'player';
    const userPlayers = [{
        role,
        email: 'juan1990@gmail.com',
        password: bcrypt.hashSync('juan', 10),
        firstName: 'Juan',
        lastName: 'Rodriguez',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'p_martinez@yahoo.com',
        password: bcrypt.hashSync('pedro', 10),
        firstName: 'Pedro',
        lastName: 'Martinez',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'matiasdiaz@gmail.com',
        password: bcrypt.hashSync('matias', 10),
        firstName: 'Matias',
        lastName: 'Diaz',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'camila8174@hotmail.com',
        password: bcrypt.hashSync('camila', 10),
        firstName: 'Camila',
        lastName: 'Perez',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'asoto@gmail.com',
        password: bcrypt.hashSync('antonio', 10),
        firstName: 'Antonio',
        lastName: 'Soto',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'nmaldonado@gmail.com',
        password: bcrypt.hashSync('nicolas', 10),
        firstName: 'Nicolas',
        lastName: 'Maldonado',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'pdpinog@gmail.com',
        password: bcrypt.hashSync('pablo', 10),
        firstName: 'Pablo',
        lastName: 'Pino',
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
