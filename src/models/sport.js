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
    isIndividual: DataTypes.BOOLEAN,
  });
  sport.associate = function associate(models) {
    //sport.belongsToMany(models.player,{ through: plays });
  };

  return sport;
};
