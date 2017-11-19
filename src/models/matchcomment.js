module.exports = function definematchComment(sequelize, DataTypes) {
  const matchComment = sequelize.define('matchComment', {
    content: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: "No puede ser un comentario vacio"
        },
      },
    }
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

  matchComment.prototype.getCommenter = function(){
    return this.player;
  }
  return matchComment;
};
