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
    // associations can be defined here
  };
  return compoundReview;
};
