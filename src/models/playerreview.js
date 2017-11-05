module.exports = function defineplayerReview(sequelize, DataTypes) {
  const playerReview = sequelize.define('playerReview', {
    isPending: {
      type: DataTypes.BOOLEAN,
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        max: 5,
        min: 1,
      },
    },
    content: DataTypes.TEXT,
  });
  playerReview.associate = function associate(models) {
    playerReview.belongsTo(models.player, { as: 'reviewed' });
    playerReview.belongsTo(models.user, { as: 'reviewer' });
    playerReview.belongsTo(models.match);

    playerReview.addScope('defaultScope', {
      order: [
        ['updatedAt', 'DESC']
      ],
      include: [{
        model: sequelize.models.player,
        as: 'reviewed',
      }]
    }, {
      override: true
    });
  };
  playerReview.removeAttribute('id');

  return playerReview;
};
