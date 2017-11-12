import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TeamCommentsNew from '../containers/TeamCommentsNew';
import TeamCommentsDisplay from '../components/TeamCommentsDisplay';
import teamCommentsService from '../services/teamComments';

export default class TeamComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      loading: false,
      error: undefined,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    this.fetchComments();
  }

  async fetchComments() {
    this.setState({ loading: true });
    try {
      const result = await teamCommentsService.get(this.props.teamId, true);
      this.setState({ comments: result.comments, loading: false });
    } catch (error) {
      this.setState({ error: 'No se pudieron cargar los comentarios', loading: false });
    }
  }

  async onSubmit(data) {
    this.setState({ loading: true, error: undefined });
    try {
      const json = await teamCommentsService.postComment(this.props.teamId, true, data);
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
    await this.fetchComments();
  }

  async onDelete(event, data) {
    event.preventDefault();
    const json = await teamCommentsService.deleteComment(this.props.teamId, data.id);
    await this.fetchComments();
  }

  renderNewCommentForm(){
    if (this.props.canComment === 'true') { // HACK: it comes as string from html
      return (
        <TeamCommentsNew
          onSubmit={this.onSubmit}
        />
      );
    }
  }

  render() {
    if (this.state.loading) {
      return <p>Cargando comentarios...</p>;
    }
    return (
      <div>
        <h4>Comentarios públicos</h4>
        { this.state.error && <div className="error">Error: {this.state.error}</div>}
        { this.renderNewCommentForm() }
        <TeamCommentsDisplay
          comments={this.state.comments}
          onDelete={this.onDelete}
        />
      </div>
    );
  }
}
