import React, { Component } from 'react';

export default class TeamCommentsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { content: ''};
    this.onSubmit = this.onSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }

  onInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  onSubmit() {
    this.props.onSubmit(this.state);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="content">
            <span>Deja un comentario:</span>
            <input
              type="textarea"
              name="content"
              id="content"
              value={this.state.content}
              onChange={this.onInputChange}
            />
          </label>
          <div>
            <input type="submit" value="Comentar2" />
          </div>
        </form>
      </div>
    );
  }
}
