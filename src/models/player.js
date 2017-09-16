module.exports = function defineplayer(sequelize, DataTypes) {
  const player = sequelize.define('player', {
    email: {
      type: DataTypes.STRING,
      unique: true, // REVIEW: add custom validator?
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes poner un email"
        },
        isEmail: {
          msg: "El email no es válido"
        },
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes poner una contraseña"
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes poner un nombre"
        },
      },
    },
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
    photo: DataTypes.STRING,
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
    player.belongsToMany(models.sport, { through: models.plays });
    player.belongsToMany(models.team, { through: models.isMember });
  };
  return player;
};
