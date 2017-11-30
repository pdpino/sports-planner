const faker = require('faker');

module.exports = {
  up(queryInterface, Sequelize) {
    let id = 2; // HACK: starting id hardcoded
    // id = 1 is admin
    const players = [{
        // 'juan1990@gmail.com',
        gender: 'masculino',
        birthday: '1990-05-10',
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // 'p_martinez@yahoo.com',
        gender: 'masculino',
        birthday: '1995-01-20',
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // 'matiasdiaz@gmail.com',
        gender: 'masculino',
        birthday: '1998-02-10',
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // 'camila8174@hotmail.com',
        gender: 'femenino',
        birthday: '1996-12-08',
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // 'asoto@gmail.com',
        gender: 'masculino',
        birthday: '1997-05-20',
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // 'nmaldonado@gmail.com',
        gender: 'masculino',
        birthday: '1991-09-11',
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        // 'pdpinog@gmail.com',
        gender: 'masculino',
        birthday: '1995-03-11',
        userId: id++,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    return queryInterface.bulkInsert('players', players);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('players', null);
  },
};
