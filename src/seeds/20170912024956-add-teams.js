module.exports = {
  up(queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
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

    return queryInterface.bulkInsert('teams', teams, {});
  },

  down(queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('teams', null, {});
  },
};
