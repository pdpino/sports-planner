module.exports = {
  up(queryInterface, Sequelize) {
    const friendships = [{
      playerId: 3, // matias
      friendId: 7, // pablo
      isAccepted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 1, // juan
      friendId: 7, // pablo
      isAccepted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 6, // nicolas
      friendId: 7, // pablo
      isAccepted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 3, // matias
      friendId: 2, // pedro
      isAccepted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('friendships', friendships);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('friendships', null);
  },
};
