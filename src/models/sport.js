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
    sport.hasMany(models.team);
    sport.hasMany(models.match);
    sport.hasMany(models.field);
    sport.belongsToMany(models.player, { through: models.plays });
  };

  return sport;
};
