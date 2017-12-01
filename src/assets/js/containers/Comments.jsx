import React, { Component } from 'react';
import CommentsNew from '../containers/CommentsNew';
import CommentsDisplay from '../components/CommentsDisplay';

export default class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      loadingComments: false,
      error: undefined,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.fetchComments();
  }

  async fetchComments() {
    this.setState({ loadingComments: true });
    try {
      const result = await this.props.fetchComments();
      this.setState({ comments: result.comments, loadingComments: false });
    } catch (error) {
      console.log('No se pudieron cargar los comentarios: ', error);
      this.setState({ error: 'No se pudieron cargar los comentarios', loadingComments: false });
    }
  }

  async onSubmit(data) {
    this.setState({ error: undefined });
    try {
      const json = await this.props.postComment(data);
    } catch (error) {
      this.setState({ error: error.message });
    }
    await this.fetchComments();
  }

  async onDelete(event, data) {
    event.preventDefault();
    const json = await this.props.deleteComment(data.id);
    await this.fetchComments();
  }

  refresh(event){
    event.preventDefault();
    this.fetchComments();
  }

  renderNewCommentForm(){
    if (this.props.canComment) {
      return (
        <CommentsNew
          onSubmit={this.onSubmit}
        />
      );
    }
  }

  renderComments(){
    if (this.state.loadingComments) {
      return <p>Cargando comentarios...</p>;
    }
    return (
      <CommentsDisplay
        comments={this.state.comments}
        onDelete={this.onDelete}
      />
    );
  }

  render() {
    return (
      <div>
        <div id="comments-sup-bar">
          <h4>{ this.props.title }</h4>
          <form onSubmit={this.refresh}>
            <input className="refresh-button" src="/assets/refresh.png" type="image" alt="Recargar" />
          </form>
        </div>
        { this.state.error && <div className="error">Error: {this.state.error}</div>}
        { this.renderNewCommentForm() }
        { this.renderComments() }
      </div>
    );
  }
}
