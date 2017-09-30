module.exports = {
  up(queryInterface, Sequelize) {
    const admin = {
      role: 'admin',
      email: 'admin@admin.com',
      password: 'admin', // really safe
      firstName: 'Admin',
      lastName: 'Admin',
      photo: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return queryInterface.bulkInsert('users', [admin]);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null);
  },
};
