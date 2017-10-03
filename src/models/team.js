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
  return team;
};
