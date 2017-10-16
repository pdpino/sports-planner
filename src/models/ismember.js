module.exports = function defineisMember(sequelize, DataTypes) {
  const isMember = sequelize.define('isMember', {
    isCaptain: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });
  isMember.associate = function associate(models) {
    // associations can be defined here
  };
  return isMember;
};
