import React, { Component } from 'react';
import TeamComments from './TeamComments';
import ToggleTeamComments from './ToggleTeamComments';

export default class AllTeamComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenPublic: true,
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle(data) {
    this.setState({ chosenPublic: data.chosenPublic })
  }

  canSeePrivateComments() {
    // HACK: prop comes as string
    return this.props.showPrivateComments === 'true';
  }

  renderPrivateComments() {
    if (this.canSeePrivateComments()) {
      // NOTE: if can the user can see the private comments, then can also make private comments
      return (
        <TeamComments
          canComment={true}
          isPublic={false}
          {...this.props}
        />
      );
    }
  }

  renderPublicComments() {
    // HACK: canPublicComment === 'true' because props come as strings
    return (
      <div>
        <TeamComments
          canComment={this.props.canPublicComment === 'true'}
          isPublic={true}
          {...this.props}
        />
      </div>
    );
  }

  renderCommentSwitch() {
    if(this.canSeePrivateComments()){
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
