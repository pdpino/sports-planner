module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('players', [{
        email: 'admin@admin.jugamos.com',
        name: 'Admin',
        password: 'ADMIN', // really safe
        isAdmin: true,
        photo: null,
        gender: "masculino",
        birthday: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }], {});
  },

  down(queryInterface, Sequelize) {
    // TODO !!
  },
};
