const Sequelize = require('sequelize');

module.exports = function matchHelpers(app) {
  /** Return the visible matches for the currentPlayer logged in **/
  app.context.getVisibleMatches = async function(){
    if (this.hasAdminPermission()){
      const allMatches = await this.orm.match.findAll();
      return allMatches;
    }

    let visibleMatches = await this.orm.match.scope('public').findAll();

    if(this.state.isPlayerLoggedIn){
      const privateMatches = await this.orm.match.scope({
        method: ['private', this.state.currentPlayer.id]
      }).findAll();

      visibleMatches = visibleMatches.concat(privateMatches);
    }

    return visibleMatches;
  }

  app.context.requireSeeMatchPermission = async function(match){
    const hasSeePermission = match.isPublic
      || await match.isPlayerInvited(this.state.currentPlayer);
    this.assert(hasSeePermission, 401, 'No tienes permisos');
  }
};
