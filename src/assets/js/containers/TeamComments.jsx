import React, { Component } from 'react';
import Comments from './Comments';
import ToggleTeamComments from './ToggleTeamComments';
import teamCommentsService from '../services/teamComments';

export default class TeamComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenPublic: true,
    };
    this.toggle = this.toggle.bind(this);
    this.fetchComments = this.fetchComments.bind(this);
    this.postComment = this.postComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  toggle(data) {
    this.setState({ chosenPublic: data.chosenPublic })
  }

  fetchComments(isPublic) {
    return teamCommentsService.get(this.props.teamId, isPublic);
  }

  postComment(isPublic, data) {
    return teamCommentsService.postComment(this.props.teamId, isPublic, data);
  }

  deleteComment (commentId) {
    return teamCommentsService.deleteComment(this.props.teamId, commentId);
  }

  renderComments(isPublic, canComment, title){
    // NOTE: the key is added so both components (public and private) are different ones
    return (
      <Comments
        key={isPublic}
        canComment={canComment}
        title={title}
        fetchComments={() => this.fetchComments(isPublic)}
        postComment={(data) => this.postComment(isPublic, data)}
        deleteComment={this.deleteComment}
      />
    );
  }

  renderPrivateComments() {
    if (this.props.canSeePrivateComments) {
      // NOTE: if can the user can see the private comments, then can also make private comments
      return this.renderComments(false, true, 'Comentarios privados');
    }
  }

  renderPublicComments() {
    return this.renderComments(true, this.props.canPublicComment, 'Comentarios públicos');
  }

  renderCommentSwitch() {
    if(this.props.canSeePrivateComments){
      return (
        <div>
          <ToggleTeamComments
            chosenPublic={this.state.chosenPublic}
            onChange={this.toggle}
          />
        </div>
      );
    }
  }

  render() {
    let comments;
    if (this.state.chosenPublic) {
      comments = this.renderPublicComments();
    } else {
      comments = this.renderPrivateComments();
    }

    return (
      <div>
        {this.renderCommentSwitch()}
        {comments}
      </div>
    );
  }
}
