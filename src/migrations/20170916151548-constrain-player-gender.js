module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('players', ['gender'], {
      type: 'check',
      name: 'player_genders',
      where: {
        gender: ['masculino', 'femenino']
        // HACK: genders copied in model.player (and probably routers/players)
      }
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('players', 'player_genders');
  },
};
