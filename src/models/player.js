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
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true,
      },
    },
    photo: DataTypes.STRING,
    gender: {
      type: DataTypes.ENUM,
      values: ['masculino', 'femenino'], // HACK: copied in migration (and probably in routes/players)
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });
  player.associate = function associate(models) {
    player.belongsToMany(models.sport, { through: models.plays });
    player.belongsToMany(models.team, { through: models.isMember });
  };
  return player;
};
