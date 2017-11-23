import React, { Component } from 'react';

export default class GenericForm extends Component {
  // NOTE: use this form as a guide, prefer composition over inheritance
  constructor(props) {
    super(props);
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
      <form onSubmit={this.onSubmit}>
        <input type="submit" value="Boton" />
      </form>
    );
  }
}
