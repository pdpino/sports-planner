module.exports = function definewallComment(sequelize, DataTypes) {
  const wallComment = sequelize.define('wallComment', {
    content: DataTypes.TEXT,
  });
  wallComment.associate = function associate(models) {
    wallComment.belongsTo(models.player, {
      as: 'commenter',
      foreignKey: 'commenterId',
    });
    wallComment.belongsTo(models.player, {
      as: 'wallPlayer',
      foreignKey: 'wallPlayerId',
    });

    wallComment.addScope('defaultScope', {
      order: [
        ['createdAt', 'DESC']
      ],
      include: [{
        model: sequelize.models.player,
        as: 'commenter'
      }],
    }, {
      override: true
    });
  };

  wallComment.prototype.getCommenter = function(){
    return this.commenter;
  }
  return wallComment;
};
