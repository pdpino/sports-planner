import React from 'react';

function displayNotificationsList(notifications){
  const displayedNotifications = [];
  notifications.forEach((notification) => {
    displayedNotifications.push(
      <li key={notification.id}>
        { notification.message }
      </li>
    );
  });
  return displayedNotifications;
}

export default function Notifications(props) {
  return (
    <div>
      <h2>Notificaciones</h2>
      <form onSubmit={props.onSubmit}>
        <input type="submit" value="Recargar" />
      </form>
      <p>Hay { props.notifications.length } notificaciones </p>
      <ul> { displayNotificationsList(props.notifications) } </ul>
    </div>
  );
}
