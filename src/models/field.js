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
        min:5,
        max: 1440,
      }
    },
    photo: DataTypes.STRING,
  });

  field.associate = function associate(models) {
    field.belongsTo(models.sport);
    field.belongsTo(models.compound);
    field.hasMany(models.scheduleBase);
    field.hasMany(models.schedule);

    field.addScope('api', {
      include: [{
        model: sequelize.models.sport
      }, {
        model: sequelize.models.compound,
      }]
    });
    field.addScope('withCompound', {
      include: [{
        model: sequelize.models.compound,
      }]
    });
  };

  field.prototype.getPhoto = function() {
    return this.photo || '/assets/pencil.png';
  }

  return field;
};
