module.exports = {
  up(queryInterface, Sequelize) {
    const invitedPlayers = [{
      playerId: 7, // pablo
      matchId: 1, // partido del domingo
      isAdmin: true,
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 1, // juan
      matchId: 1, // partido del domingo
      isAdmin: false,
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 6, // nicolas
      matchId: 1, // partido del domingo
      isAdmin: false,
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 8, // alberto
      matchId: 1, // partido del domingo
      isAdmin: false,
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 9, // lucas
      matchId: 1, // partido del domingo
      isAdmin: false,
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('isPlayerInviteds', invitedPlayers);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('isPlayerInviteds', null);
  },
};
