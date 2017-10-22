const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('lodash');

async function getUserObject(models, userId){
  const user = await models.user.findById(userId);
  return { // REVIEW: replace this by a js method (like assign)?
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    photo: user.photo,
  };
}

module.exports = function defineplayer(sequelize, DataTypes) {
  // REVIEW: use status functions in ctx.state ?? (like with invitationStatuses?)
  const friendStatus = [
    'not',
    'sent',
    'waiting',
    'accepted',
  ];
  const genders = ['masculino', 'femenino'];
  const player = sequelize.define('player', {
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Debes ingresar tu fecha de nacimiento"
        },
        // notEmpty: { // notNull?
        //   msg: "Debes ingresar una fecha de nacimiento válida"
        // },
        isBefore: {
          args: [ String(new Date()) ],
          msg: "No puedes ingresar una fecha de nacimiento en el futuro"
        },
      },
    },
    gender: {
      type: DataTypes.ENUM,
      values: genders, // HACK: copied in migration (and probably in routes/players)
      allowNull: false,
      validate: {
        // NOTE: notNull has been deprecated, a warning is raised
        // notNull: {
        //   msg: "Debes ingresar un género"
        // },
        notEmpty: {
          msg: "Debes ingresar un género"
        },
      },
    },
  });

  player.associate = function associate(models) {
    player.belongsTo(models.user);
    player.belongsToMany(models.sport, { through: models.plays });
    player.belongsToMany(models.team, { through: models.isMember });

    player.belongsToMany(models.match, { through: models.isPlayerInvited });

    player.belongsToMany(player, {
      as: { singular: 'friend', plural: 'friends' },
      through: models.friendship,
    });

    player.hasMany(models.playerNotification);
  };

  /** Load user info (email, names and photo) into player object **/
  player.afterFind(async function loadUser(result, options) {
    // REVIEW: avoid DB query?
    if(!result){
      return;
    }

    if(result.constructor == Array) {
      for (let i = 0; i < result.length; i++) {
          Object.assign(result[i], await getUserObject(sequelize.models, result[i].userId));
      }
    } else {
      Object.assign(result, await getUserObject(sequelize.models, result.userId));
    }
  });

  player.getGenders = function() { return genders; }

  player.prototype.getName = function() {
    return `${this.firstName} ${this.lastName}`;
  }

  player.canAddFriend = function(status){ return status === 'not' };
  player.canDeleteFriend = function(status){ return status === 'accepted' };
  player.canAcceptFriend = function(status){ return status === 'sent' };
  player.waitingFriend = function(status){ return status === 'waiting' };

  player.prototype.getFriendshipStatus = async function(friend){
    if (this.id === friend.id){
      return false;
    }
    const results = await player.findAll({
      include: [{
        model: player,
        as: 'friends',
        required: true, // With this is an inner join and not a left outer
        through: {
          where: {
            [Op.or]: [{
                playerId: this.id,
                friendId: friend.id,
              },
              {
                playerId: friend.id,
                friendId: this.id,
              }],
          },
        }
      }]
    });

    if(results.length === 0){
      return 'not';
    }
    const sendingPlayer = results[0];
    const receivingPlayer = sendingPlayer.friends[0];

    if (receivingPlayer.friendship.isAccepted){
      return 'accepted';
    } else { // Not accepted yet, who sent it?
      return (sendingPlayer.id === this.id) ? 'waiting' : 'sent';
    }
  }

  player.prototype.getAllFriends = async function(){
    // REVIEW: instead of getAllFriends, it should be called getFriends and override the other,
    // but the other needs to be called (how do you do that?)
    const friendsSide1 = await this.getFriends({
      through: {
        where: {
          isAccepted: true
        }
      }
    });

    const friendsSide2 = await player.findAll({
      include: [{
        model: player,
        as: 'friends',
        required: true,
        through: {
          where: {
            friendId: this.id,
            isAccepted: true,
          },
        }
      }]
    });

    return _.unionWith(friendsSide1, friendsSide2, function(a, b) { return a.id === b.id; });
  }

  return player;
};
