module.exports = function defineteam(sequelize, DataTypes) {
  const team = sequelize.define('team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    logo: DataTypes.STRING,
  });
  team.associate = function associate(models) {
    // associations can be defined here
    team.belongsTo(models.sport);
    team.belongsToMany(models.player,{ through: "isMember"});
  };
  return team;
};
