module.exports = function definecompound(sequelize, DataTypes) {
  const compound = sequelize.define('compound', {
    localEmail: DataTypes.STRING,
    photo: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debe tener un nombre"
        },
      }
    },
    address: DataTypes.STRING,
    localPhone: DataTypes.STRING,
  });

  compound.associate = function associate(models) {
    compound.belongsTo(models.compoundOwner);
    compound.hasMany(models.field);
    compound.hasMany(models.compoundReview, { as: 'reviews' });
  };

  return compound;
};
