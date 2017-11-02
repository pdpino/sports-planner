module.exports = function matchHelpers(app) {
  /** Return the visible matches for the currentPlayer logged in **/
  app.context.getVisibleMatches = async function(){
    if (this.state.hasAdminPermission){
      const allMatches = await this.orm.match.findAll();
      return allMatches;
    }

    let visibleMatches = await this.orm.match.findAll({
      where: {
        isPublic: true,
      }
    });

    if(this.state.isPlayerLoggedIn){
      const privateMatches = await this.orm.match.findAll({
        where: {
          isPublic: false,
        },
        include: [{
          model: this.orm.player,
          where: {
            id: this.state.currentPlayer.id,
          },
          // HACK: through object copied in multiple places
          through: {
            where: {
              status: { [Sequelize.Op.not]: 'rejectedByAdmin' }
              // HACK: invitation status hardcoded
            }
          }
        }]
      });
      visibleMatches = visibleMatches.concat(privateMatches);

      // NOTE: something like this could be used, but the public and private matches should be disjuncts:
      // const _ = require('lodash');
      // visibleMatches = _.unionWith(visibleMatches, privateMatches, function(a, b) { return a.id === b.id; });
    }

    return visibleMatches;
  }

};
