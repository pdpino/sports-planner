module.exports = function defineschedule(sequelize, DataTypes) {
  const schedule = sequelize.define('schedule', {
    price: DataTypes.INTEGER,
    hours: DataTypes.STRING,
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    open: DataTypes.BOOLEAN,
  });
  schedule.associate = function associate(models) {
    schedule.belongsTo(models.field);
    // associations can be defined here
  };
  return schedule;
};
