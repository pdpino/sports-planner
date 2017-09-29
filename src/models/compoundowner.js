module.exports = function definecompoundOwner(sequelize, DataTypes) {
  const compoundOwner = sequelize.define('compoundOwner', {
    phone: DataTypes.STRING,
  });
  compoundOwner.associate = function associate(models) {
    // associations can be defined here
  };
  return compoundOwner;
};