module.exports = function defineisPlayerInvited(sequelize, DataTypes) {
  const isPlayerInvited = sequelize.define('isPlayerInvited', {
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['sentToUser', 'sentByUser', 'userRejected', 'rejectedByUser', 'accepted'], // HACK: copied in migration (and probably in routes/isPlayerInviteds)
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
