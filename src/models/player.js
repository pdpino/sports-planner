module.exports = function defineplayer(sequelize, DataTypes) {
  const player = sequelize.define('player', {
    email: {
      type: DataTypes.STRING,
      unique: true, // REVIEW: add custom validator?
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty:true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    age: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: true,
      },
    },
    photo: DataTypes.STRING,
    gender: DataTypes.STRING,
  });
  player.associate = function associate(models) {
    player.belongsToMany(models.sport, { through: models.plays });
    player.belongsToMany(models.team,{ through: models.isMember});
  };
  return player;
};
