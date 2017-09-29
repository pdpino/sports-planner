module.exports = function defineuser(sequelize, DataTypes) {
  const user = sequelize.define('user', {
    isPlayer: DataTypes.BOOLEAN,
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
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes poner un nombre"
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes poner un apellido"
        },
      },
    },
    photo: DataTypes.STRING,
  });
  user.associate = function associate(models) {
    // associations can be defined here
  };
  return user;
};
