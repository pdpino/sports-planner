const moment = require('moment');

function unFoldDate(fullDate){
  const date = moment(fullDate, "YYYY MM DD H:mm");
  return {
    dateYear: date.format('YYYY'),
    dateMonth: date.format('MM'),
    dateDay: date.format('DD'),
    dateHour: date.format('H'),
    dateMinute: date.format('mm'),
  };
}

async function setDate(result, options) {
  if (!result) {
    return;
  }

  if (result.constructor == Array) {
    for (let i = 0; i < result.length; i++) {
      Object.assign(result[i], unFoldDate(result[i].date));
    }
  } else {
    Object.assign(result, unFoldDate(result.date));
  }
}

module.exports = function definematch(sequelize, DataTypes) {
  const match = sequelize.define('match', {
    name: {
      type: DataTypes.STRING,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
    },
    date: {
      type: DataTypes.DATE,
      isDate: true,
    },
  });

  match.associate = function associate(models) {
    match.belongsTo(models.sport);
    match.belongsToMany(models.player, { through: models.isPlayerInvited });
    match.belongsToMany(models.team, { through: models.isTeamInvited });
  };

  /** Boolean indicating if the player has modify permission on the match **/
  match.prototype.hasModifyPermission = async function(player){
    return player && await this.hasPlayer(player, {
      through: {
        where: {
          isAdmin: true
        }
      }
    });
  }

  match.afterCreate(setDate); // FIXME: not working for build()
  match.afterFind(setDate);

  match.getDefaultName = function(player){
    return (player.firstName) ? `Partido de ${player.firstName}` : "Partido";
  }

  // async function assertNotEmptyName(instance){
  //   if (!instance.name){
  //     const sport = await sequelize.models.sport.findById(instance.sportId);
  //     return instance.set('name', 'Partido de ' + sport.name);
  //   }
  // }
  //
  // /** Set a default name **/
  // match.afterCreate(assertNotEmptyName);
  // match.afterUpdate(assertNotEmptyName); // REVIEW: players no pueden dejar match.name vacio?

  return match;
};
