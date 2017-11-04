module.exports = function definematchComment(sequelize, DataTypes) {
  const matchComment = sequelize.define('matchComment', {
    content: DataTypes.TEXT,
  });
  matchComment.associate = function associate(models) {
    matchComment.belongsTo(models.match);
    matchComment.belongsTo(models.player);

    matchComment.addScope('defaultScope', {
      order: [
        ['createdAt', 'DESC']
      ],
      include: [{
        model: sequelize.models.player
      }]
    }, {
      override: true
    });
  };
  return matchComment;
};
