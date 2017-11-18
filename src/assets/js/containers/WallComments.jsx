import React, { Component } from 'react';
import Comments from './Comments';
import wallCommentsService from '../services/wallComments';

export default class WallComments extends Component {
  // REVIEW: make this a component?
  constructor(props) {
    super(props);
    this.state = { };
    this.fetchComments = this.fetchComments.bind(this);
    this.postComment = this.postComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  fetchComments() {
    return wallCommentsService.get(this.props.playerId);
  }

  postComment(data) {
    return wallCommentsService.postComment(this.props.playerId, data);
  }

  deleteComment(commentId) {
    return wallCommentsService.deleteComment(this.props.playerId, commentId);
  }

  render() {
    console.log("AAA: ", this.props);
    return (
      <Comments
        canComment={this.props.canComment}
        title="Muro"
        fetchComments={this.fetchComments}
        postComment={this.postComment}
        deleteComment={this.deleteComment}
      />
    );
  }
}
