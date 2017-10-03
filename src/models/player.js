async function getUserObject(models, userId){
  const user = await models.user.findById(userId);
  return { // REVIEW: replace this by a js method (like assign)?
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photo: user.photo,
  };
}

module.exports = function defineplayer(sequelize, DataTypes) {
  const player = sequelize.define('player', {
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes ingresar tu fecha de nacimiento"
        },
        notEmpty: {
          msg: "Debes ingresar una fecha de nacimiento válida"
        },
        isBefore: {
          args: [ String(new Date()) ],
          msg: "No puedes ingresar una fecha de nacimiento en el futuro"
        },
      },
    },
    gender: {
      type: DataTypes.ENUM,
      values: ['masculino', 'femenino'], // HACK: copied in migration (and probably in routes/players)
      allowNull: false,
      validate: {
        // NOTE: notNull has been deprecated, a warning is raised
        // notNull: {
        //   msg: "Debes ingresar un género"
        // },
        notEmpty: {
          msg: "Debes ingresar un género"
        },
      },
    },
  });
  player.associate = function associate(models) {
    player.belongsTo(models.user);
    player.belongsToMany(models.sport, { through: models.plays });
    player.belongsToMany(models.team, { through: models.isMember });

    player.belongsToMany(models.match, { through: models.isInvited });
  };

  /** Load user info (email, names and photo) into player object **/
  player.afterFind(async function loadUser(result, options) {
    // REVIEW: avoid DB query?
    if(!result){
      console.log("Loading no players, options:", options);
      return;
    } else if(result.constructor == Array) {
      for (let i = 0; i < result.length; i++) {
          Object.assign(result[i], await getUserObject(sequelize.models, result[i].userId));
      }
    } else {
      Object.assign(result, await getUserObject(sequelize.models, result.userId));
    }

  });

  return player;
};
