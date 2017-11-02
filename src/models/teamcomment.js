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
    // associations can be defined here
  };

  teamComment.prototype.prettyTimestamp = function(){
    const a = moment(this.createdAt);
    return a.format('YYYY-MMM-d H:mm');
  }
  return teamComment;
};
