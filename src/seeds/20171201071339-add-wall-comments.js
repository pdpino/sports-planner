module.exports = {
  up(queryInterface, Sequelize) {
    const wallComments = [{
      commenterId: 3, // matias
      wallPlayerId: 8, // pedro
      content: 'Juguemos un partido!',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('wallComments', wallComments);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('wallComments', null);
  },
};
