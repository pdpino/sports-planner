const Sequelize = require('sequelize');
const moment = require('moment');
const helpers = require('./helpers');

const unWrapDate = helpers.getHookFunction(function (match){
  const date = moment(match.date, "YYYY MM DD H:mm");
  Object.assign(match, {
    dateYear: date.format('YYYY'),
    dateMonth: date.format('MM'),
    dateDay: date.format('DD'),
    dateHour: date.format('H'),
    dateMinute: date.format('mm'),
  });
});

module.exports = function definematch(sequelize, DataTypes) {
  const match = sequelize.define('match', {
    name: {
      type: DataTypes.STRING,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
    },
    isDone: {
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
    match.hasMany(models.compoundReview);

    // REVIEW: add this default scope
    // The others scopes extend from this one?
    // If not, the scopes should always be called alongside defaultScope,
    // or the date order should be copied on the other scopes
    // match.addScope('defaultScope', {
    //   order: [
    //     ['date', 'DESC']
    //   ],
    // }, {
    //   override: true
    // });

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

    match.addScope('api', {
      include: [{
        model: sequelize.models.sport
      }, {
        model: sequelize.models.player
      }, {
        model: sequelize.models.team
      }]
    });
  };

  match.afterCreate(unWrapDate); // FIXME: not working for build()
  match.afterFind(unWrapDate);

  match.parseParams = function(params, player){
    const parsedParams = Object.assign(params);

    parsedParams.name = params.name || match.getDefaultName(player);
    parsedParams.isPublic = Boolean(params.isPublic);

    if (params.dateYear) {
      parsedParams.date = moment(`${params.dateYear} ${params.dateMonth} ${params.dateDay} ${params.dateHour} ${params.dateMinute}`, "YYYY MM DD H:mm");
    }

    if (parsedParams.date && !parsedParams.date.isValid()){
      parsedParams.date = null;
    }

    return parsedParams;
  }

  /** A player creates a match **/
  match.playerCreates = async function(player, params) {
    const parsedParams = match.parseParams(params, player);

    const matchInstance = await match.create(parsedParams);
    await player.addMatch(matchInstance.id, {
      through: {
        isAdmin: true,
        status: 'accepted' // HACK: invitation status harcoded
      }
    });
    return matchInstance;
  }

  match.getDefaultName = function(player){
    return (player.firstName) ? `Partido de ${player.firstName}` : 'Partido';
  }

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

  match.prototype.invitePlayer = function(player){
    return this.addPlayer(player, {
      through: {
        status: 'sent' // HACK: invitation status harcoded
      }
    });
  }

  match.prototype.invitePlayers = function(players){
    // TODO: merge with invitePlayer function (use duck typing)
    return this.addPlayers(players, {
      through: {
        status: 'sent' // HACK: invitation status harcoded
      }
    });
  }

  match.prototype.updatePlayerInvitation = function(player, status, isAdmin){
    return this.addPlayer(player, {
      through: {
        status: status || player.isPlayerInvited.status,
        isAdmin,
      }
    });
  }

  match.prototype.inviteTeam = function(team){
    return this.addTeam(team, {
      through: {
        status: 'sent' // HACK: invitation status harcoded
      }
    });
  }

  match.prototype.updateTeamInvitation = function(team, newStatus){
    return this.addTeam(team, {
      through: {
        status: newStatus || team.isTeamInvited.status
      }
    });
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

  match.prototype.isInThePast = function(){
    return moment().isAfter(this.date);
  }

  match.prototype.canEnableReviews = function(options){
    return !this.isDone && this.isInThePast() &&
      (options.hasModifyPermission || this.hasModifyPermission(options.player));
  }

  match.prototype.areReviewsEnabled = function(){
    return this.isDone && this.isInThePast();
  }

  async function getReviewsFromUser(match, reviewerUser, isPending){
    const reviews = await match.getPlayerReviews({
      where: {
        isPending,
        reviewerId: reviewerUser.id,
      }
    });
    for(let i=0; i < reviews.length; i++){
      reviews[i].reviewerPlayer = await reviews[i].reviewer.getPlayer();
    }
    return reviews;
  }

  match.prototype.getPendingReviewsFromUser = function(reviewerUser){
    return getReviewsFromUser(this, reviewerUser, true);
  }

  match.prototype.getDoneReviewsFromUser = function(reviewerUser){
    return getReviewsFromUser(this, reviewerUser, false);
  }

  match.prototype.getCompoundReviewFromUser = async function(reviewerPlayer){
    const compoundReviews = await this.getCompoundReviews({
      where: {
        playerId: reviewerPlayer.id,
        // REVIEW: should the compound be included?
      }
    });
    return compoundReviews[0];
  }

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
    return pendingReviews[0];
  }

  match.prototype.hasPendingReview = function(reviewerUser, reviewedPlayer){
    return this.getPendingReview(reviewerUser, reviewedPlayer);
  }

  /** reviewer is a person **/
  match.prototype.createPendingPlayerReview = function(reviewer, reviewedPlayerId){
    return this.createPlayerReview({
      isPending: true,
      reviewerId: reviewer.userId,
      reviewedId: reviewedPlayerId,
    });
  }

  match.prototype.createPendingCompoundReview = function(player, compound){
    return this.createCompoundReview({
      isPending: true,
      playerId: player.id,
      compoundId: compound.id,
    });
  }

  match.prototype.markAsDone = function(){
    return this.update({
      isDone: true
    });
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
