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
<<<<<<< HEAD
    //sport.belongsToMany(models.player,{ through: plays });
=======
    // associations can be defined here
    sport.hasMany(models.team);
>>>>>>> 8c251231e6c277486d4cd52bd674e1f78de77633
  };

  return sport;
};
