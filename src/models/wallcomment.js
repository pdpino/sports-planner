module.exports = function definewallComment(sequelize, DataTypes) {
  const wallComment = sequelize.define('wallComment', {
    content: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: "No puede ser un comentario vacio"
        },
      },
    }
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
