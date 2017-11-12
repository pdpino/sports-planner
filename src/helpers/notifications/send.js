const mailInvitationPlayerToTeam = require('../../mailers/invite-player-team');
const mailInvitationPlayerToMatch = require('../../mailers/invite-player-match');
const mailInvitationTeamToMatch = require('../../mailers/invite-team-match');
const mailFieldReservation = require('../../mailers/reserve-field');
const mailAskFriend = require('../../mailers/ask-friend');

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
      await this.sendNotification(sender, receivers[i], options);
    }
  }

  app.context.askFriend = async function(sender, receiver){
    await this.sendNotification(sender, receiver, {
      kind: 'friendshipAsked',
      entityObj: sender,
    });

    mailAskFriend(this, receiver.email, {
      askedBy: sender.getName(),
      playerLink: this.getFullUrl('player', sender.id),
    });
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

    mailInvitationPlayerToTeam(this, receiver.email, {
      teamName: team.name,
      invitedBy: sender.getName(),
      playerLink: this.getFullUrl('player', sender.id),
      teamLink: this.getFullUrl('team', team.id),
    });
  }

  app.context.invitePlayerToMatch = async function(sender, receiver, match){
    await this.sendNotification(sender, receiver, {
      kind: 'playerInvitedToMatch',
      entityObj: sender,
      eventObj: match,
    });
    mailInvitationPlayerToMatch(this, receiver.email, {
      matchName: match.name,
      matchDate: this.prettyTimestamp(match.date),
      invitedBy: sender.getName(),
      playerLink: this.getFullUrl('player', sender.id),
      matchLink: this.getFullUrl('match', match.id),
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

    mailInvitationTeamToMatch(this, teamCaptain.email, {
      matchName: match.name,
      matchDate: this.prettyTimestamp(match.date),
      teamName: invitedTeam.name,
      invitedBy: sender.getName(),
      playerLink: this.getFullUrl('player', sender.id),
      teamLink: this.getFullUrl('team', invitedTeam.id),
      matchLink: this.getFullUrl('match', match.id),
    });
  }

  app.context.teamAcceptMatch = function(sender, receivers, team, match){
    return this.sendNotifications(sender, receivers, {
      kind: 'teamAcceptedMatch',
      entityObj: team,
      eventObj: match,
    });
  }

  app.context.reserveField = async function(player, owner, compound, field){
    await this.sendNotification(player, owner, {
      kind: 'playerReserveField',
      entityObj: player,
      eventObj: field,
    });

    mailFieldReservation(this, owner.email, {
      playerName: player.getName(),
      fieldName: field.name,
      compoundName: compound.name,
      playerLink: this.getFullUrl('player', player.id),
      compoundLink: this.getFullUrl('compound', compound.id),
      fieldLink: this.getFullUrl('field', { id: field.id, compoundId: compound.id }),
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
