module.exports = {
  up(queryInterface, Sequelize) {
    const teams = [{
        name: 'Team1',
        logo: "",
        sportId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Team23',
        logo: "",
        sportId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Team45',
        logo: "",
        sportId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }];

    return queryInterface.bulkInsert('teams', teams);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('teams', null);
  },
};
