module.exports = function defineisPlayerInvited(sequelize, DataTypes) {
  // HACK: copied in migration
  const possibleStatus = [
    'sent', // Sent to the user by the admin, the user must accept
    'asked', // The user asked if can be invited, the admin must accept
    'rejectedByAdmin', // The admin said no
    'rejectedByUser', // The user said no
    'accepted', // The accepting party (user or admin) said yes
  ];

  const isPlayerInvited = sequelize.define('isPlayerInvited', {
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: possibleStatus,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La invitación debe tener un estado'
        },
      },
    },
  });

  isPlayerInvited.associate = function associate(models) {
    isPlayerInvited.belongsTo(models.team);
    // isPlayerInvited.belongsTo(models.player); // hostId
  };

  return isPlayerInvited;
};
