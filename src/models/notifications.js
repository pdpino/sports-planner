module.exports = function definenotification(sequelize, DataTypes) {
  // copied in migration
  const notificationKinds = [
    'friendshipAsked', // Someone added me as a friend
    'friendshipAccepted',
    'addedToTeam',
    'playerInvitedToMatch',
    'playerAcceptedInMatch',
    'teamInvitedToMatch',
    'teamAcceptedInMatch',
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
  });

  notification.associate = function associate(models) {
    notification.belongsTo(models.user, { as: 'sender' });
    notification.belongsTo(models.user, { as: 'receiver' });
  };

  notification.prototype.toString = function(){
    // const messages = {
    //   'friendshipAsked',
    //   'friendshipAccepted',
    //   'addedToTeam',
    //   'playerInvitedToMatch',
    //   'playerAcceptedInMatch',
    //   'teamInvitedToMatch',
    //   'teamAcceptedInMatch',
    // }

    return this.kind;
  }

  return notification;
};
