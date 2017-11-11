import React from 'react';

function displayButtons(buttons){
  // NOTE: the hidden input doesn't hurt if get or post are used
  // REVIEW: if the hidden input is provided, the method=... in the form is needed at all?
  const displayedButtons = [];
  buttons.forEach((button) => {
    displayedButtons.push(
      <form action={button.path} method={ (button.method === 'get') ? 'get' : 'post' }>
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
      <h4>Notificaciones</h4>
      <form onSubmit={props.onSubmit}>
        <input type="submit" value="Recargar" />
      </form>
      <p>Hay { props.notifications.length } notificaciones </p>
      <ul> { displayNotificationsList(props.notifications) } </ul>
    </div>
  );
}
