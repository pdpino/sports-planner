module.exports = function definematch(sequelize, DataTypes) {
  const match = sequelize.define('match', {
    isPublic: {
      type:DataTypes.BOOLEAN,
    },
    date: {
      type: DataTypes.DATE,
    },
  });
  match.associate = function associate(models) {
    match.belongsTo(models.sport);
    match.belongsToMany(models.player, { through: models.isInvited });
  };
  return match;
};
