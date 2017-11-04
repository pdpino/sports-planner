const moment = require('moment');

module.exports = function defineteamComment(sequelize, DataTypes) {
  const teamComment = sequelize.define('teamComment', {
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
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

  teamComment.prototype.prettyTimestamp = function(){
    return moment(this.createdAt).format('YYYY-MMM-d H:mm');
  }
  return teamComment;
};
