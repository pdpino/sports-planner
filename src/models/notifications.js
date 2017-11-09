const helpers = require('./helpers');

module.exports = function definenotification(sequelize, DataTypes) {
  // notification kinds copied in migration
  const nofiticationMessages = {
    friendshipAsked: (entityName, eventName) =>
        `${entityName} te envió una solicitud de amistad`,
    friendshipAccepted: (entityName, eventName) =>
        `${entityName} aceptó tu solicitud de amistad`,
    addedToTeam: (entityName, eventName) =>
        `${entityName} te agregó al equipo '${eventName}'`,
    playerInvitedToMatch: (entityName, eventName) =>
        `${entityName} te invitó al partido '${eventName}'`,
    playerAcceptedMatch: (entityName, eventName) =>
        `${entityName} aceptó la invitación al partido '${eventName}'`,
    teamInvitedToMatch: (entityName, eventName) =>
        `Tu equipo '${entityName}' fue invitado al partido '${eventName}'`,
    teamAcceptedMatch: (entityName, eventName) =>
        `El equipo '${entityName}' aceptó ir al partido '${eventName}'`,
    playerReserveField: (entityName, eventName) =>
        `El jugador '${entityName}' solicitó una reserva en '${eventName}'`,
    ownerAcceptFieldReservation: (entityName, eventName) =>
        `El dueño de la cancha '${entityName}' aceptó tu solicitud para '${eventName}'`,
  };
  const notificationKinds = Object.keys(nofiticationMessages);

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
    },
    entityId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    eventId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  });

  notification.associate = function associate(models) {
    notification.belongsTo(models.user, { as: 'sender' });
    notification.belongsTo(models.user, { as: 'receiver' });

    notification.addScope('defaultScope', {
      order: [
        ['createdAt', 'DESC']
      ],
    }, {
      override: true
    });
  };

  notification.prototype.toString = function(){
    return nofiticationMessages[this.kind](this.entityName, this.eventName);
  }

  notification.readNotifications = async function(notifications){
    for(let i = 0; i < notifications.length; i++){
      await notifications[i].update({ wasRead: true });
    }
  }

  notification.afterFind(helpers.getHookFunction(function (notification){
    // Used to pass attributes to react app in the client
    // HACK: copy it in dataValues, instead of the object itself
    Object.assign(notification.dataValues, {
      message: notification.toString(),
    });
  }));

  return notification;
};
