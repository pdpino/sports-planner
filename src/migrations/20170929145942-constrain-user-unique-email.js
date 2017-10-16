module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('users', ['email'], {
      type: 'unique',
      name: 'user_unique_email'
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('users', 'user_unique_email');
  },
};
