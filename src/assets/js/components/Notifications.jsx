import React from 'react';

function displayNotifications(notifications){
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
      <p>Hay { props.notifications.length } notificaciones </p>
      <ul> { displayNotifications(props.notifications) } </ul>
    </div>
  );
}
