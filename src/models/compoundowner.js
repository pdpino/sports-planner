const helpers = require('./helpers');

module.exports = function definecompoundOwner(sequelize, DataTypes) {
  const compoundOwner = sequelize.define('compoundOwner', {
    phone: DataTypes.STRING,
  });
  compoundOwner.associate = function associate(models) {
    compoundOwner.belongsTo(models.user);
    compoundOwner.hasMany(models.compound);

    compoundOwner.addScope('defaultScope', {
      include: [{
        model: sequelize.models.user
      }]
    }, {
      override: true
    });
  };

  compoundOwner.afterFind(helpers.copyUserInfo);

  compoundOwner.prototype.getName = function() { return helpers.getPersonName(this); }

  return compoundOwner;
};
