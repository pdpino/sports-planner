module.exports = function definecompoundOwner(sequelize, DataTypes) {
  const compoundOwner = sequelize.define('compoundOwner', {
    phone: DataTypes.STRING,
  });
  compoundOwner.associate = function associate(models) {
    compoundOwner.belongsTo(models.user);
  };
  return compoundOwner;
};
