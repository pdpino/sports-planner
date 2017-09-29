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
  };
  return player;
};
