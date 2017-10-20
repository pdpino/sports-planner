module.exports = function defineisTeamInvited(sequelize, DataTypes) {
  const possibleStatus = ['sentToTeam', 'sentByTeam', 'teamRejected', 'rejectedByTeam', 'accepted']; // HACK: copied in migration
  // TODO: replace by: ['sent', 'asked', 'rejectedByAdmin', 'rejectedByUser', 'accepted'];

  const isTeamInvited = sequelize.define('isTeamInvited', {
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
    score: DataTypes.INTEGER,
  });
  isTeamInvited.associate = function associate(models) {

  };
  return isTeamInvited;
};
