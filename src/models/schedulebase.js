module.exports = function definescheduleBase(sequelize, DataTypes) {
  const scheduleBase = sequelize.define('scheduleBase', {
    price: {
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate:{
        min:0,
      }
    },
    hours: DataTypes.STRING,
    day: DataTypes.INTEGER,
    month: DataTypes.INTEGER,
    year: DataTypes.INTEGER,
    open:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    priority:{
      type:DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    weekday: DataTypes.INTEGER,
    lastGenerated: DataTypes.DATE,
  });
  scheduleBase.associate = function associate(models) {
    scheduleBase.belongsTo(models.field);
  };
  return scheduleBase;
};
