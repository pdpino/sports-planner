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
    },
  });
  match.associate = function associate(models) {
    match.belongsTo(models.sport);
    match.belongsToMany(models.player, { through: models.isPlayerInvited });
    match.belongsToMany(models.team, { through: models.isTeamInvited });
  };

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
