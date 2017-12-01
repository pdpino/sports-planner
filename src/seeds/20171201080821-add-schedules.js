module.exports = {
  up(queryInterface, Sequelize) {
    const schedules = [{
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '12:00 - 13:00',
      date: '2017-12-04 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '13:00 - 14:00',
      date: '2017-12-04 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '14:00 - 15:00',
      date: '2017-12-04 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '15:00 - 16:00',
      date: '2017-12-04 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '12:00 - 13:00',
      date: '2017-12-11 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '13:00 - 14:00',
      date: '2017-12-11 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '14:00 - 15:00',
      date: '2017-12-11 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      hours: '15:00 - 16:00',
      date: '2017-12-11 00:00',
      status: 'Available',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('schedules', schedules);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('schedules', null);
  },
};
