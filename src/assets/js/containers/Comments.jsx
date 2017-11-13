import React, { Component } from 'react';
import CommentsNew from '../containers/CommentsNew';
import CommentsDisplay from '../components/CommentsDisplay';

export default class Comments extends Component {
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
      const result = await this.props.fetchComments();
      this.setState({ comments: result.comments, loading: false });
    } catch (error) {
      this.setState({ error: 'No se pudieron cargar los comentarios', loading: false });
    }
  }

  async onSubmit(data) {
    this.setState({ loading: true, error: undefined });
    try {
      const json = await this.props.postComment(data);
      this.setState({ loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
    await this.fetchComments();
  }

  async onDelete(event, data) {
    event.preventDefault();
    const json = await this.props.deleteComment(data.id);
    await this.fetchComments();
  }

  renderNewCommentForm(){
    // HACK: === 'true' because prop comes as string
    // Be careful when using this class and passing canComment as string or boolean
    if (this.props.canComment === 'true') {
      return (
        <CommentsNew
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
        <h4>{ this.props.title }</h4>
        { this.state.error && <div className="error">Error: {this.state.error}</div>}
        { this.renderNewCommentForm() }
        <CommentsDisplay
          comments={this.state.comments}
          onDelete={this.onDelete}
        />
      </div>
    );
  }
}
