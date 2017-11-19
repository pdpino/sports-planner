import React, { Component } from 'react';
import Comments from './Comments';
import matchCommentsService from '../services/matchComments';

export default class MatchComments extends Component {
  constructor(props) {
    super(props);
    this.state = { };
    this.fetchComments = this.fetchComments.bind(this);
    this.postComment = this.postComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  fetchComments() {
    return matchCommentsService.get(this.props.matchId);
  }

  postComment(data) {
    return matchCommentsService.postComment(this.props.matchId, data);
  }

  deleteComment(commentId) {
    return matchCommentsService.deleteComment(this.props.matchId, commentId);
  }

  render() {
    return (
      <Comments
        canComment={this.props.canComment}
        title="Comentarios"
        fetchComments={this.fetchComments}
        postComment={this.postComment}
        deleteComment={this.deleteComment}
      />
    );
  }
}
