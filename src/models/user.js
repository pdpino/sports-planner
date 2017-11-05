const bcrypt = require('bcrypt');

async function buildPasswordHash(instance) {
  if (instance.changed('password')) {
    const hash = await bcrypt.hash(instance.password, 10);
    instance.set('password', hash);
  }
}

module.exports = function defineuser(sequelize, DataTypes) {
  const user = sequelize.define('user', {
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
    role: {
      type: DataTypes.ENUM,
      values: ['admin', 'player', 'owner'], // HACK: copied in migration (and probably in routes/users)
      allowNull: false, // REVIEW: Add message
      validate: {
        notEmpty: {
          msg: "No se ha ingresado un rol"
        },
      },
    },
    photo: DataTypes.STRING,
  });

  user.associate = function associate(models) {
    user.hasMany(models.notification, { as: 'sentNotifications', foreignKey: 'senderId' });
    user.hasMany(models.notification, { as: 'receivedNotifications', foreignKey: 'receiverId' });

    user.hasMany(models.playerReview, { foreignKey: 'reviewerId' });
  };

  user.beforeUpdate(buildPasswordHash);
  user.beforeCreate(buildPasswordHash);

  user.prototype.checkPassword = function checkPassword(password) {
    return bcrypt.compare(password, this.password);
  };

  user.prototype.getName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  return user;
};
