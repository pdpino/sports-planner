module.exports = {
  up(queryInterface, Sequelize) {
    const teamMembers = [{
      playerId: 2, // pedro
      teamId: 3, // joga bonito
      isCaptain: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 3, // matias
      teamId: 3, // joga bonito
      isCaptain: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 5, // antonio
      teamId: 3, // joga bonito
      isCaptain: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 1, // juan
      teamId: 1, // naranja mecanica
      isCaptain: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 6, // nicolas
      teamId: 1, // naranja mecanica
      isCaptain: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 8, // alberto
      teamId: 2, // los bulls
      isCaptain: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 8, // alberto
      teamId: 4, // la rojita
      isCaptain: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      playerId: 9, // lucas
      teamId: 4, // la rojita
      isCaptain: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('isMembers', teamMembers);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('isMembers', null);
  },
};
