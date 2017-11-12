import React, { Component } from 'react';

export default class ToggleTeamComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenPublic: props.chosenPublic,
    }
    this.onChange = this.onChange.bind(this);
  }

  async onChange(event) {
    // HACK: the value event.target.value should be used (?), but is always true
    await this.setState({ chosenPublic: !this.state.chosenPublic })
    this.props.onChange(this.state);
  }

  render() {
    return (
      <form onChange={this.onChange}>
        <label htmlFor="chosenPublic">Públicos</label>
        <input
          type="checkbox"
          name="chosenPublic"
          defaultChecked={this.state.chosenPublic}
          />
      </form>
    );
  }
}
