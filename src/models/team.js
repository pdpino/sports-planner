module.exports = function defineteam(sequelize, DataTypes) {
  const team = sequelize.define('team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes ingresar un nombre"
        },
      },
    },
    logo: DataTypes.STRING,
  });

  team.associate = function associate(models) {
    team.belongsTo(models.sport);
    team.belongsToMany(models.player, { through: models.isMember });
    team.belongsToMany(models.match, { through: models.isTeamInvited });
    team.hasMany(models.teamComment, { as: 'comments' });

    team.addScope('withSport', {
      include: [{
        model: sequelize.models.sport
      }]
    });
  };

  /** Boolean indicating if the player has modify permission on the team **/
  team.prototype.hasModifyPermission = async function(player){
    return player && await this.hasPlayer(player, {
      through: {
        where: {
          isCaptain: true
        }
      }
    });
  }

  team.prototype.getCaptain = async function(){
    const teamCaptains = await this.getPlayers({
      through: {
        where: {
          isCaptain: true
        }
      }
    });
    return (teamCaptains && teamCaptains.length > 0) ? teamCaptains[0] : null;
  }

  team.prototype.invitePlayer = async function(player, isCaptain){
    await this.addPlayer(player, {
      through: {
        isCaptain,
      }
    });
  }

  team.prototype.askForMatch = async function(match){
    await this.addMatch(match, {
      through: {
        status: 'asked' // HACK: invitation status harcoded
      }
    });
  }

  team.prototype.makeComment = async function(player, params){
    await sequelize.models.teamComment.create({
      playerId: player.id,
      teamId: this.id,
      content: params.content,
      isPublic: params.isPublic,
    });
  }

  function getComments(team, isPublic){
    return team.getComments({
      where: {
        isPublic,
      },
    });
  }

  team.prototype.getPublicComments = function(){ return getComments(this, true); }

  team.prototype.getPrivateComments = function(){ return getComments(this, false); }

  return team;
};
