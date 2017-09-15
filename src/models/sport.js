module.exports = function definesport(sequelize, DataTypes) {
  const sport = sequelize.define('sport', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    logo: DataTypes.STRING,
    isIndividual: {
      type: DataTypes.BOOLEAN,
      // allowNull: false,
      // set(val) { // HACK: parse the value to a boolean, fix when checkbox input sends 'on'
      //   console.log("isIndividual VALUE", val);
      //   this.setDataValue('isIndividual', Boolean(val));
      // },
    }
  });
  sport.associate = function associate(models) {
    // associations can be defined here
    sport.hasMany(models.team);
    sport.belongsToMany(models.player, { through: models.plays });
  };

  return sport;
};
