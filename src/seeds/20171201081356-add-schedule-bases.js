module.exports = {
  up(queryInterface, Sequelize) {
    const scheduleBases = [{
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      open: true,
      weekday: 1,
      priority: 0,
      hours: '12:00 - 13:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      open: true,
      weekday: 1,
      priority: 0,
      hours: '13:00 - 14:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      open: true,
      weekday: 1,
      priority: 0,
      hours: '14:00 - 15:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      fieldId: 1, // cancha 1
      // matchId: 1,
      price: 10000,
      open: true,
      weekday: 1,
      priority: 0,
      hours: '15:00 - 16:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('scheduleBases', scheduleBases);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('scheduleBases', null);
  },
};
