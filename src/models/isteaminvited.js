module.exports = function defineisTeamInvited(sequelize, DataTypes) {
  const isTeamInvited = sequelize.define('isTeamInvited', {
    status: {
      type: DataTypes.ENUM,
      values: ['sentToTeam', 'sentByTeam', 'teamRejected', 'rejectedByTeam', 'accepted'], // HACK: copied in migration
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
