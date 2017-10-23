module.exports = function definenotification(sequelize, DataTypes) {
  // copied in migration
  const notificationKinds = [
    'friendshipAsked', // Someone added me as a friend
    'friendshipAccepted',
    'addedToTeam',
    'playerInvitedToMatch',
    'playerAcceptedMatch',
    'teamInvitedToMatch',
    'teamAcceptedMatch',
    // Faltan las de recintos
  ];

  const notification = sequelize.define('notification', {
    wasRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    kind: {
      type: DataTypes.ENUM,
      values: notificationKinds,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes ingresar un tipo de notificación"
        },
      },
    },
    entityName: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    eventName: {
      type: DataTypes.STRING,
      defaultValue: '',
    }
  });

  notification.associate = function associate(models) {
    notification.belongsTo(models.user, { as: 'sender' });
    notification.belongsTo(models.user, { as: 'receiver' });
  };

  // REFACTOR: merge this with notificationKinds
  const parseNotification = {
    'friendshipAsked': (entityName, eventName) =>
        `${entityName} te envió una solicitud de amistad`,
    'friendshipAccepted': (entityName, eventName) =>
        `${entityName} aceptó tu solicitud de amistad`,
    'addedToTeam': (entityName, eventName) =>
        `${entityName} te agregó al equipo '${eventName}'`,
    'playerInvitedToMatch': (entityName, eventName) =>
        `${entityName} te invitó al partido '${eventName}'`,
    'playerAcceptedMatch': (entityName, eventName) =>
        `${entityName} aceptó la invitación al partido '${eventName}'`,
    'teamInvitedToMatch': (entityName, eventName) =>
        `Tu equipo '${entityName}' fue invitado al partido '${eventName}'`,
    'teamAcceptedMatch': (entityName, eventName) =>
        `El equipo '${entityName}' aceptó ir al partido '${eventName}'`,
  };

  notification.prototype.toString = function(){
    return parseNotification[this.kind](this.entityName, this.eventName);
  }

  return notification;
};
