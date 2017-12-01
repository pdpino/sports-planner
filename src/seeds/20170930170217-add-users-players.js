const bcrypt = require('bcrypt');

module.exports = {
  up(queryInterface, Sequelize) {
    const role = 'player';
    const userPlayers = [{
        role,
        email: 'juan1990@gmail.com', // playerId = 1
        password: bcrypt.hashSync('juan', 10),
        firstName: 'Juan',
        lastName: 'Rodriguez',
        photo: 'https://s3.amazonaws.com/uifaces/faces/twitter/joeymurdah/128.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'p_martinez@yahoo.com', // playerId = 2
        password: bcrypt.hashSync('pedro', 10),
        firstName: 'Pedro',
        lastName: 'Martinez',
        photo: 'https://s3.amazonaws.com/uifaces/faces/twitter/richardgarretts/128.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'matiasdiaz@gmail.com', // playerId = 3
        password: bcrypt.hashSync('matias', 10),
        firstName: 'Matias',
        lastName: 'Diaz',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'camila8174@hotmail.com', // playerId = 4
        password: bcrypt.hashSync('camila', 10),
        firstName: 'Camila',
        lastName: 'Perez',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'asoto@gmail.com', // playerId = 5
        password: bcrypt.hashSync('antonio', 10),
        firstName: 'Antonio',
        lastName: 'Soto',
        photo: 'https://s3.amazonaws.com/uifaces/faces/twitter/thiagovernetti/128.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'nmaldonado@gmail.com', // playerId = 6
        password: bcrypt.hashSync('nicolas', 10),
        firstName: 'Nicolas',
        lastName: 'Maldonado',
        photo: 'https://s3.amazonaws.com/uifaces/faces/twitter/elliotnolten/128.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'pdpinog@gmail.com', // playerId = 7
        password: bcrypt.hashSync('pablo', 10),
        firstName: 'Pablo',
        lastName: 'Pino',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'alberto1993@gmail.com', // playerId = 8
        password: bcrypt.hashSync('alberto', 10),
        firstName: 'Alberto',
        lastName: 'Gonzalez',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        role,
        email: 'lbarrios@gmail.com', // playerId = 9
        password: bcrypt.hashSync('lucas', 10),
        firstName: 'Lucas',
        lastName: 'Barrios',
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
