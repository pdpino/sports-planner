module.exports = function definecompoundReview(sequelize, DataTypes) {
  const compoundReview = sequelize.define('compoundReview', {
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
  compoundReview.associate = function associate(models) {
    compoundReview.belongsTo(models.compound);
    compoundReview.belongsTo(models.player);
    compoundReview.belongsTo(models.match);

    compoundReview.addScope('defaultScope', {
      order: [
        ['updatedAt', 'DESC']
      ],
      include: [{
        model: sequelize.models.player,
      }]
    }, {
      override: true
    });
  };
  return compoundReview;
};
