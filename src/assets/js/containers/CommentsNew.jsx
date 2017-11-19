import React, { Component } from 'react';

export default class CommentsNew extends Component {
  constructor(props) {
    super(props);
    this.state = { content: '' };
    this.onSubmit = this.onSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  onSubmit(event) {
    if (this.state.content) {
      this.props.onSubmit(this.state);
    } else {
      event.preventDefault();
      this.setState({ error: 'Comentario no puede estar vacio' });
    }
  }

  render() {
    return (
      <div>
        { this.state.error && <div className="error">{this.state.error}</div>}
        <form onSubmit={this.onSubmit}>
          <label htmlFor="content">
            <span>Escribe un comentario:</span>
            <input
              type="textarea"
              name="content"
              id="content"
              value={this.state.content}
              onChange={this.onInputChange}
            />
          </label>
          <div>
            <input type="submit" value="Comentar" />
          </div>
        </form>
      </div>
    );
  }
}
