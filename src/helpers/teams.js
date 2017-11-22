const Sequelize = require('sequelize');

module.exports = function teamHelpers(app) {
  app.context.requirePlayerInTeam = async function(team){
    const isInTeam = await team.hasPlayer(this.state.currentPlayer);
    this.assert(isInTeam, 401);
  }
};
