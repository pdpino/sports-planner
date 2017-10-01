module.exports = function defineisInvited(sequelize, DataTypes) {
  const isInvited = sequelize.define('isInvited', {
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['sentToUser', 'sentByUser', 'userRejected','rejectedByUser', 'accepted'], // HACK: copied in migration (and probably in routes/isInviteds)
      allowNull: false,
      validate: {
        // NOTE: notNull has been deprecated, a warning is raised
        // notNull: {
        //   msg: "Estado no asignado"
        // },
        notEmpty: {
          msg: 'Estado no asignado'
        },
      },
    },
  });

  isInvited.associate = function associate(models) {

  };

  return isInvited;
};
