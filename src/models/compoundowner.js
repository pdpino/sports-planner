const _ = require('lodash');

function unWrapUser(compoundOwner){
  return _.pick(compoundOwner.user, 'firstName', 'lastName', 'email', 'photo');
}

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

  /** Copy user info (email, names and photo) into player object, so is more accesible **/
  compoundOwner.afterFind(function copyUserInfo(result) {
    // HACK: copied from models/player
    if(result.constructor == Array) {
      for (let i = 0; i < result.length; i++) {
          Object.assign(result[i], unWrapUser(result[i]));
      }
    } else {
      Object.assign(result, unWrapUser(result));
    }

  });


  return compoundOwner;
};
