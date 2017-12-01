module.exports = {
  up(queryInterface, Sequelize) {
    const invitedTeams = [{
      teamId: 1, // naranja mecanica
      matchId: 1, // partido del domingo
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      teamId: 4, // la rojita
      matchId: 1, // partido del domingo
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    return queryInterface.bulkInsert('isTeamInviteds', invitedTeams);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('isTeamInviteds', null);
  },
};
