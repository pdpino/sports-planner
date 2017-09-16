module.exports = function definesport(sequelize, DataTypes) {
  const sport = sequelize.define('sport', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes ingresar un nombre"
        },
      }
    },
    logo: DataTypes.STRING,
    isIndividual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });
  sport.associate = function associate(models) {
    // associations can be defined here
    sport.hasMany(models.team);
    sport.belongsToMany(models.player, { through: models.plays });
  };

  return sport;
};
