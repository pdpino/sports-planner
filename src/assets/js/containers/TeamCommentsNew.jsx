import React, { Component } from 'react';
import GenericForm from './GenericForm';

export default class TeamCommentsNew extends GenericForm {
  constructor(props) {
    super(props);
    this.state = { content: '' };
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
