module.exports = function defineplays(sequelize, DataTypes) {
  const plays = sequelize.define('plays', {
    position: DataTypes.STRING,
  });
  plays.associate = function associate(models) {
    // associations can be defined here
  };
  return plays;
};