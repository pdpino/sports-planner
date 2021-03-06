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

    compound.addScope('api', {
      include: [{
        model: sequelize.models.compoundOwner
      }, {
        model: sequelize.models.field,
      }, {
        model: sequelize.models.compoundReview,
        as: 'reviews',
      }]
    });
  };

  compound.prototype.getPhoto = function() {
    return this.photo || '/assets/compound-logo.png';
  }

  compound.prototype.getPendingReview = async function(player, match){
    if (!player || !match) {
      return null;
    }

    const pendingReviews = await this.getReviews({
      where: {
        playerId: player.id,
        matchId: match.id,
        isPending: true,
      }
    });
    return pendingReviews[0];
  }

  compound.prototype.getDoneReviews = function(){
    return this.getReviews({
      where: {
        isPending: false,
      }
    });
  }

  return compound;
};
