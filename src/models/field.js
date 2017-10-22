module.exports = function definefield(sequelize, DataTypes) {
  const field = sequelize.define('field', {
    name:  {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debe tener un nombre"
        },
    }
  },
    openingHour: {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:"00:00",
    },
    closingHour: {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:"00:00",
    },
    modules:{
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:1,
      validate:{
        min:1,
        }
      },
    photo: DataTypes.STRING,
  });
  field.associate = function associate(models) {
    field.belongsTo(models.sport);
    field.belongsTo(models.compound);
    field.hasMany(models.scheduleBase);
    field.hasMany(models.schedule);
  };
  return field;
};
