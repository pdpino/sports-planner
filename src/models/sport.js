module.exports = function definesport(sequelize, DataTypes) {
  const sport = sequelize.define('sport', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    logo: DataTypes.STRING,
    isIndividual: DataTypes.BOOLEAN,
  });
  sport.associate = function associate(models) {
    // associations can be defined here
  };
  return sport;
};
