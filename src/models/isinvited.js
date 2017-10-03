module.exports = function defineisInvited(sequelize, DataTypes) {
  const isInvited = sequelize.define('isInvited', {
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['sentToUser', 'sentByUser', 'userRejected', 'rejectedByUser', 'accepted'], // HACK: copied in migration (and probably in routes/isInviteds)
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La invitación debe tener un estado'
        },
      },
    },
  });

  isInvited.associate = function associate(models) {
    isInvited.belongsTo(models.team);
    // isInvited.belongsTo(models.player); // hostId
  };

  return isInvited;
};
