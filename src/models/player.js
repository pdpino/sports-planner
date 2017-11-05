const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const _ = require('lodash');
const helpers = require('./helpers');

function calculateAge(player){
  // OPTIMIZE this function? dates can be substracted
  const today = new Date();

  const year = player.birthday.substring(0,4);
  const month = player.birthday.substring(5,7);
  const day = player.birthday.substring(8,10);

  const dateBirthday = new Date(year, month-1, day);
  const diff = today - dateBirthday;

  player.age = Math.floor(diff/(1000*60*60*24*365.25));
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

    player.hasMany(models.teamComment);
    player.hasMany(models.matchComment);

    player.hasMany(models.wallComment, { as: 'commentedWalls', foreignKey: 'commenterId' });
    player.hasMany(models.wallComment, { as: 'myWallComments', foreignKey: 'wallPlayerId' });

    player.hasMany(models.playerReview, { as: 'reviews', foreignKey: 'reviewedId' });

    player.addScope('defaultScope', {
      include: [{
        model: sequelize.models.user
      }]
    }, {
      override: true
    });
  };

  player.afterFind(helpers.copyUserInfo);

  player.afterFind(helpers.getHookFunction(calculateAge));

  player.getGenders = function() { return genders; }

  player.prototype.getName = function() {
    // NOTE: if the player was found using find(), firstName and lastName are copied into the player
    // if not, then try to use the user's names
    if (this.firstName){
      return `${this.firstName} ${this.lastName}`;
    } else if (this.user) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    return '';
  }

  player.canAddFriend = (status) => status === 'not';
  player.canDeleteFriend = (status) => status === 'accepted';
  player.canAcceptFriend = (status) => status === 'sent';
  player.waitingFriend = (status) => status === 'waiting';
  player.hasCommentPermission = (status) => status === 'self' || status === 'accepted';

  player.prototype.getFriendshipStatus = async function(friend){
    if (this.id === friend.id){
      return 'self';
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

  player.prototype.askForMatch = async function(match){
    await this.addMatch(match, {
      through: {
        status: 'asked' // HACK: invitation status harcoded
      }
    });
  }

  player.prototype.updateMatch = async function(match, params){
    await this.addMatch(match, {
      through: {
        status: params.status || match.isPlayerInvited.status,
        isAdmin: params.isAdmin,
      }
    });
  }

  player.prototype.playSport = async function(sport, position){
    await this.addSport(sport, {
      through: {
        position,
      }
    });
  }

  player.prototype.getMatch = function(matchId){
    return helpers.findOneAssociatedById(this, 'getMatches', matchId);
  }

  player.prototype.getSport = function(sportId){
    return helpers.findOneAssociatedById(this, 'getSports', sportId);
  }

  player.prototype.receiveWallComment = function(commenter, params){
    return this.createMyWallComment({
      commenterId: commenter.id,
      content: params.content,
    });
  }

  return player;
};
