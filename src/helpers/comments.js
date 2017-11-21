const Sequelize = require('sequelize');

module.exports = function commentHelpers(app) {
  app.context.canDeleteComment = function(comment){
    return this.state.currentPlayer && this.state.currentPlayer.id === comment.getCommenter().id;
  }

  app.context.getDisplayableComments = function(comments){
    return comments.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        commenterName: comment.getCommenter().getName(),
        timestamp: this.createdAtTimestamp(comment),
        canDelete: this.canDeleteComment(comment),
      };
    });
  }

};
