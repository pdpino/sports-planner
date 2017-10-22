module.exports = function definefriends(sequelize, DataTypes) {
  const friendship = sequelize.define('friendship', {
    isAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  friendship.associate = function associate(models) {
    // associations can be defined here
  };
  return friendship;
};
