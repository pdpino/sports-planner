module.exports = {
  up(queryInterface, Sequelize) {
    const compounds = [{
      name: 'Canchas el sausalito',
      photo: '/assets/compound-logo.png',
      localEmail: 'contacto@elsausalito.cl',
      compoundOwnerId: 4, // Tomas
      address: 'Providencia 3192',
      localPhone: '+562 2558 1792',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('compounds', compounds);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('compounds', null);
  },
};
