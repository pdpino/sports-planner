module.exports = function defineteamComment(sequelize, DataTypes) {
  const teamComment = sequelize.define('teamComment', {
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: "No puede ser un comentario vacio"
        },
      },
    }
  });
  teamComment.associate = function associate(models) {
    teamComment.belongsTo(models.team);
    teamComment.belongsTo(models.player);

    teamComment.addScope('defaultScope', {
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

  teamComment.prototype.getCommenter = function(){
    return this.player;
  }

  return teamComment;
};
