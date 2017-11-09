import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import NotificationsApp from './apps/Notifications';

const notificationsAppContainer = document.getElementById('notifications-react-app');

if (notificationsAppContainer) {
  const render = function render(Component) {
    ReactDOM.render(
      <AppContainer>
        <Component {...notificationsAppContainer.dataset}/>
      </AppContainer>,
      notificationsAppContainer,
    );
  };

  render(NotificationsApp);

  // Webpack Hot Module Replacement API
  if (module.hot) {
    module.hot.accept('./components/App', () => { render(App); });
  }
}
