module.exports = function definecompound(sequelize, DataTypes) {
  const compound = sequelize.define('compound', {
    localemail: DataTypes.STRING,
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
    localphone: DataTypes.STRING,
  });
  compound.associate = function associate(models) {
    compound.belongsTo(models.compoundOwner);
    compound.hasMany(models.field);
  };
  return compound;
};
