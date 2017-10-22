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

  return team;
};
