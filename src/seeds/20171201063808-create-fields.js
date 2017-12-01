module.exports = {
  up(queryInterface, Sequelize) {
    const fields = [{
      sportId: 1,
      compoundId: 1,
      name: 'Cancha 1',
      openingHour: '10:00',
      closingHour: '21:00',
      modules: 60,
      photo: '/assets/field-logo.svg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('fields', fields);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('fields', null);
  },
};
