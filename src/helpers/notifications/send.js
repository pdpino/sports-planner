const sendInvitationPlayerMail = require('../../mailers/invitation-player');
const sendInvitationTeamMail = require('../../mailers/invitation-team');
const sendFieldReservation = require('../../mailers/reservation-field');

module.exports = function notificationSendHelpers(app) {
  /**
   * Send a notification
   * sender and receiver are a player or a owner (must have an userId property)
   * example-options = {
   *    kind: 'notifKind',
   *    entity: player, // or team, match, etc; must have name or getName()
   *    event: match, // or team, field, etc; must have name
   * }
   **/
  app.context.sendNotification = function(sender, receiver, options){
    if (!options.eventObj){ // Support empty event
      options.eventObj = { id: 0, name: '' };
    }
    return this.orm.notification.create({
      senderId: sender.userId,
      receiverId: receiver.userId,
      wasRead: false,
      kind: options.kind,
      entityId: options.entityObj.id,
      eventId: options.eventObj.id,
      entityName: options.entityObj.name || options.entityObj.getName(),
      eventName: options.eventObj.name,
    });
  }

  app.context.sendNotifications = async function(sender, receivers, options){
    for(let i = 0; i < receivers.length; i++){
      await this.sendNotification(sender, receiver[i], options);
    }
  }

  app.context.addFriend = function(sender, receiver){
    return this.sendNotification(sender, receiver, {
      kind: 'friendshipAsked',
      entityObj: sender,
    });

    // TODO: send mail
    // sendInvitationPlayerMail(this, receiver.email, {
    //   eventType: 'Equipo',
    //   eventName: team.name,
    //   invitedBy: sender.getName(),
    // });
  }

  app.context.readAskedFriendNotification = async function(sender, receiver){
    const askNotifications = await this.orm.notification.findAll({
      where: {
        kind: 'friendshipAsked',
        senderId: sender.userId,
        receiverId: receiver.userId,
        wasRead: false,
      }
    });
    return this.orm.notification.readNotifications(askNotifications);
  }

  app.context.acceptFriend = async function(sender, receiver){
    return this.sendNotification(sender, receiver, {
      kind: 'friendshipAccepted',
      entityObj: sender,
    });
  }

  app.context.invitePlayerToTeam = async function(sender, receiver, team){
    await this.sendNotification(sender, receiver, {
      kind: 'addedToTeam',
      entityObj: sender,
      eventObj: team,
    });

    sendInvitationPlayerMail(this, receiver.email, {
      eventType: 'Equipo',
      eventName: team.name,
      invitedBy: sender.getName(),
    });
  }

  app.context.invitePlayerToMatch = async function(sender, receiver, match){
    await this.sendNotification(sender, receiver, {
      kind: 'playerInvitedToMatch',
      entityObj: sender,
      eventObj: match,
    });
    sendInvitationPlayerMail(this, receiver.email, {
      eventType: 'Partido',
      eventName: match.name,
      invitedBy: sender.getName(),
    });
  }

  app.context.playerAcceptMatch = function(sender, receivers, match){
    return this.sendNotifications(sender, receivers, {
      kind: 'playerAcceptedMatch',
      entityObj: sender,
      eventObj: match,
    });
  }

  app.context.inviteTeamToMatch = async function(sender, invitedTeam, teamCaptain, match){
    await this.sendNotification(sender, teamCaptain, {
      kind: 'teamInvitedToMatch',
      entityObj: invitedTeam,
      eventObj: match,
    });

    sendInvitationTeamMail(this, teamCaptain.email, {
      eventType: 'Partido',
      eventName: match.name,
      invitedBy: sender.getName(),
      teamName: invitedTeam.name,
    });
  }

  app.context.teamAcceptMatch = function(sender, receivers, team, match){
    return this.sendNotifications(sender, receivers, {
      kind: 'teamAcceptedMatch',
      entityObj: team,
      eventObj: match,
    });
  }

  app.context.reserveField = async function(player, owner, field){
    await this.sendNotification(player, owner, {
      kind: 'playerReserveField',
      entityObj: player,
      eventObj: field,
    });

    sendFieldReservation(this, owner.email, {
      playerName: player.getName(),
      fieldName: field.name,
    });
  }

  app.context.acceptFieldReservation = function(owner, matchAdmins, match, field){
    return this.sendNotifications(owner, matchAdmins, {
      kind: 'ownerAcceptFieldReservation',
      entityObj: field,
      eventObj: match,
    });
  }

};
