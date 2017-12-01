module.exports = {
  up(queryInterface, Sequelize) {
    const matchComments = [{
      playerId: 1, // juan
      matchId: 1, // partido del domingo
      content: 'Buen partido!',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 8, // alberto
      matchId: 1, // partido del domingo
      content: 'A la próxima les ganamos',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 9, // lucas
      matchId: 1, // partido del domingo
      content: 'Hay que armar otro partido!',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('matchComments', matchComments);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('matchComments', null);
  },
};
