import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import NotificationsApp from './apps/Notifications';
import TeamCommentsApp from './apps/TeamComments';
import WallCommentsApp from './apps/WallComments';

function renderApp(App, AppDivId){
  const AppDiv = document.getElementById(AppDivId);
  if(!AppDiv){
    console.log("ERROR: can't find div for react-app ", AppDivId);
    return;
  }
  const render = function render(Component) {
    ReactDOM.render(
      <AppContainer>
        <Component {...AppDiv.dataset}/>
      </AppContainer>,
      AppDiv,
    );
  };

  render(App);

  // Webpack Hot Module Replacement API
  if (module.hot) {
    module.hot.accept('./components/App', () => { render(App); });
  }
}

renderApp(NotificationsApp, 'notifications-react-app');
renderApp(TeamCommentsApp, 'team-comments-react-app');
renderApp(WallCommentsApp, 'wall-comments-react-app');
