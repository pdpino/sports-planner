import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NotificationsComponent from '../components/Notifications';
import notificationsService from '../services/notifications';

export default class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      loading: false,
      error: undefined,
    };
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.fetchNotifications();
  }

  async fetchNotifications() {
    this.setState({ loading: true });
    try {
      const result = await notificationsService.get(this.props.userId);
      this.setState({ notifications: result.notifications, loading: false });
    } catch (error){
      this.setState({ error: 'No se pudieron cargar las notificaciones', loading: false });
    }
  }

  async refresh() {
    this.fetchNotifications();
  }

  render() {
    if (this.state.loading) {
      return <p>Cargando notificaciones...</p>;
    }
    return (
      <div>
        { this.state.error && <div className="error">Error: {this.state.error}</div>}
        <NotificationsComponent
          notifications={this.state.notifications}
          onSubmit={this.refresh}
        />
      </div>
    );
  }
}
