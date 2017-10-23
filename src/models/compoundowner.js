// HACK: this is copied from models/players.js
async function getUserObject(models, userId){
  const user = await models.user.findById(userId);
  return { // REVIEW: replace this by a js method (like assign)?
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photo: user.photo,
  };
}

module.exports = function definecompoundOwner(sequelize, DataTypes) {
  const compoundOwner = sequelize.define('compoundOwner', {
    phone: DataTypes.STRING,
  });
  compoundOwner.associate = function associate(models) {
    compoundOwner.belongsTo(models.user);
    compoundOwner.hasMany(models.compound);
  };

  /**
   * Load user info (email, names and photo) into player object
   * HACK: copied from models/player
   **/
  compoundOwner.afterFind(async function loadUser(result) {
    // REVIEW: avoid DB query?
    if(result.constructor == Array) {
      for (let i = 0; i < result.length; i++) {
          Object.assign(result[i], await getUserObject(sequelize.models, result[i].userId));
      }
    } else {
      Object.assign(result, await getUserObject(sequelize.models, result.userId));
    }

  });


  return compoundOwner;
};
