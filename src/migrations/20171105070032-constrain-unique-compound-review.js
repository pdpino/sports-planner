module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addConstraint('compoundReviews', ['playerId', 'compoundId', 'matchId'], {
      type: 'unique',
      name: 'compound_review_unique'
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeConstraint('compoundReviews', 'compound_review_unique');
  },
};
