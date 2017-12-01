import React from 'react';

function displayButtons(buttons){
  // NOTE: the hidden input doesn't hurt if get or post are used
  // REVIEW: if the hidden input is provided, the method=... in the form is needed at all?
  const displayedButtons = [];
  buttons.forEach((button, index) => {
    displayedButtons.push(
      <form key={index} action={button.path} method={ (button.method === 'get') ? 'get' : 'post' }>
        <input type="hidden" name="_method" value={button.method} />
        <input type="submit" value={button.message} />
      </form>
    );
  });
  return displayedButtons;
}

function displayNotificationsList(notifications){
  const displayedNotifications = [];
  notifications.forEach((notification, index) => {
    displayedNotifications.push(
      <li key={index}>
        { notification.message }
        { displayButtons(notification.buttons) }
      </li>
    );
  });
  return displayedNotifications;
}

export default function Notifications(props) {
  return (
    <div>
      <div id="notifications-sup-bar">
        <h4>Notificaciones</h4>
        <form onSubmit={props.onSubmit}>
          <input className="refresh-button" src="/assets/refresh.png" type="image" alt="Recargar" />
        </form>
      </div>
      <div id="notifications-amount">
        <p>Hay { props.notifications.length } notificaciones</p>
      </div>
      <ul> { displayNotificationsList(props.notifications) } </ul>
    </div>
  );
}
