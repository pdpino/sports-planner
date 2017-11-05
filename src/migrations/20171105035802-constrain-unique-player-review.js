module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('playerReviews', ['reviewerId', 'reviewedId', 'matchId'], {
      type: 'unique',
      name: 'player_review_unique'
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('playerReviews', 'player_review_unique');
  },
};
