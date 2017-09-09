module.exports = function defineplayer(sequelize, DataTypes) {
  const player = sequelize.define('player', {
    email: {
      type:DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty:true,
      }
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty:true,
      }
    },
    name: {
      type:DataTypes.STRING,
      allowNull:false,
      validate: {
        notEmpty:true,
      }
    },
    age: DataTypes.INTEGER,
    photo: DataTypes.STRING,
    gender: DataTypes.STRING,
  });
  player.associate = function associate(models) {
    //player.belongsToMany(models.sport,{ through: plays});
  };
  return player;
};
