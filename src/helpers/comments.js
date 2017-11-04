const Sequelize = require('sequelize');

module.exports = function matchHelpers(app) {
  app.context.canDeleteComment = function(comment){
    return this.state.currentPlayer && this.state.currentPlayer.id === comment.playerId;
  }
};
