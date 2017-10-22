module.exports = function defineplayerNotification(sequelize, DataTypes) {
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

  const playerNotification = sequelize.define('playerNotification', {
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

  playerNotification.associate = function associate(models) {
    playerNotification.belongsTo(models.player);
  };

  return playerNotification;
};
