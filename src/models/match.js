const Sequelize = require('sequelize');
const moment = require('moment');
const helpers = require('./helpers');

const unWrapDate = helpers.getHookFunction(function (fullDate){
  const date = moment(fullDate, "YYYY MM DD H:mm");
  return {
    dateYear: date.format('YYYY'),
    dateMonth: date.format('MM'),
    dateDay: date.format('DD'),
    dateHour: date.format('H'),
    dateMinute: date.format('mm'),
  };
});

module.exports = function definematch(sequelize, DataTypes) {
  const match = sequelize.define('match', {
    name: {
      type: DataTypes.STRING,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
    },
    date: {
      type: DataTypes.DATE,
      isDate: true,
    },
  });

  match.associate = function associate(models) {
    match.belongsTo(models.sport);
    match.belongsToMany(models.player, { through: models.isPlayerInvited });
    match.belongsToMany(models.team, { through: models.isTeamInvited });
    match.hasOne(models.schedule);

    match.hasMany(models.matchComment, { as: 'comments' });
    match.hasMany(models.playerReview);

    match.addScope('withSport', {
      include: [{
        model: models.sport
      }]
    });

    match.addScope('public', {
      where: {
        isPublic: true
      }
    });

    match.addScope('private', function(playerId){
      return {
        where: {
          isPublic: false
        },
        include: [{
          model: models.player,
          where: {
            id: playerId,
          },
          through: {
            where: {
              status: { [Sequelize.Op.not]: 'rejectedByAdmin' }
              // HACK: invitation status hardcoded
            }
          }
        }]
      };
    });
  };

  /** Boolean indicating if the player has modify permission on the match **/
  match.prototype.hasModifyPermission = async function(player){
    return player && await this.hasPlayer(player, {
      through: {
        where: {
          isAdmin: true
        }
      }
    });
  }

  match.prototype.invitePlayer = async function(player){
    await this.addPlayer(player, {
      through: {
        status: 'sent' // HACK: invitation status harcoded
      }
    });
  }

  match.prototype.invitePlayers = async function(players){
    // TODO: merge with invitePlayer function (use duck typing)
    await this.addPlayers(players, {
      through: {
        status: 'sent' // HACK: invitation status harcoded
      }
    });
  }

  match.prototype.updatePlayerInvitation = async function(player, status, isAdmin){
    await this.addPlayer(player, {
      through: {
        status: status || player.isPlayerInvited.status,
        isAdmin,
      }
    });
  }

  match.prototype.inviteTeam = async function(team){
    await this.addTeam(team, {
      through: {
        status: 'sent' // HACK: invitation status harcoded
      }
    });
  }

  match.prototype.updateTeamInvitation = async function(team, newStatus){
    await this.addTeam(team, {
      through: {
        status: newStatus || team.isTeamInvited.status
      }
    });
  }

  match.afterCreate(unWrapDate); // FIXME: not working for build()
  match.afterFind(unWrapDate);

  match.getDefaultName = function(player){
    return (player.firstName) ? `Partido de ${player.firstName}` : 'Partido';
  }

  match.prototype.getAdmins = async function(){
    const matchAdmins = await this.getPlayers({
      through: {
        where: {
          isAdmin: true
        }
      }
    });
    return matchAdmins || [];
  }

  match.prototype.getPlayer = function(playerId){
    return helpers.findOneAssociatedById(this, 'getPlayers', playerId);
  }

  match.prototype.getTeam = function(teamId){
    return helpers.findOneAssociatedById(this, 'getTeams', teamId);
  }

  match.prototype.makeComment = function(player, params){
    return this.createComment({
      playerId: player.id,
      content: params.content,
    });
  }

  match.prototype.isPlayerInvited = async function(player){
    const isPlayerInvited = player &&
      await this.hasPlayer(player, {
        through: {
          where: {
            status: { [Sequelize.Op.not]: 'rejectedByAdmin' }
            // HACK: invitation status hardcoded
          }
        }
      });
    return isPlayerInvited;
  }

  // match.prototype.reviewPlayer = function(pendingReview, params){
  //   return this.addPlayerReview(pendingReview, {
  //     rating: params.rating,
  //     content: params.content,
  //     isPending: false,
  //   });
  // }

  match.prototype.getPendingReview = async function(reviewerUser, reviewedPlayer){
    if (!reviewerUser || !reviewedPlayer) {
      return null;
    }

    const pendingReviews = await this.getPlayerReviews({
      where: {
        reviewerId: reviewerUser.id,
        reviewedId: reviewedPlayer.id,
        isPending: true,
      }
    });
    console.log("ALSDKJASDL", pendingReviews);
    return pendingReviews[0];
  }

  match.prototype.hasPendingReview = function(reviewerUser, reviewedPlayer){
    return this.getPendingReview(reviewerUser, reviewedPlayer);
  }

  // async function assertNotEmptyName(instance){
  //   if (!instance.name){
  //     const sport = await sequelize.models.sport.findById(instance.sportId);
  //     return instance.set('name', 'Partido de ' + sport.name);
  //   }
  // }
  //
  // /** Set a default name **/
  // match.afterCreate(assertNotEmptyName);
  // match.afterUpdate(assertNotEmptyName); // REVIEW: players no pueden dejar match.name vacio?

  return match;
};
