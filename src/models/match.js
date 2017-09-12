module.exports = function definematch(sequelize, DataTypes) {
  const match = sequelize.define('match', {
    isPublic: {
      type:DataTypes.BOOLEAN,
    },
    date: DataTypes.DATE,
  });
  match.associate = function associate(models) {
    // associations can be defined here
  };
  return match;
};
