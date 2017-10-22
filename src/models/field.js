module.exports = function definefield(sequelize, DataTypes) {
  const field = sequelize.define('field', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debe tener un nombre"
        },
      }
    },
    prices: DataTypes.STRING,
    schedule: DataTypes.STRING,
    photo: DataTypes.STRING,
  });

  field.associate = function associate(models) {
    field.belongsTo(models.sport);
    field.belongsTo(models.compound);
  };

  return field;
};
