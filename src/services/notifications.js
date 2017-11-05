const sendInvitationPlayerMail = require('../mailers/invitation-player');
const sendInvitationTeamMail = require('../mailers/invitation-team');
const sendFieldReservation = require('../mailers/reservation-field');

/*
 * NOTE: functions receive the context to comply to a standard and because they may be moved to the ctx.state in the future
 * REVIEW: is this a service? or should it be in helpers?
 */

/**
 * Send a notification
 * sender and receiver are a player or a owner (must have an userId property)
 * example-options = {
 *    kind: 'notifKind',
 *    entityName: 'Juanito', // Puede ser un equipo o un nombre de jugador
 *    eventName: 'Partido de juanito',
 * }
 **/
function sendNotification(ctx, sender, receiver, options){
  return ctx.orm.notification.create({
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

async function sendNotifications(ctx, sender, receivers, options){
  for(let i = 0; i < receivers.length; i++){
    await sendNotification(ctx, sender, receiver[i], options);
  }
}

/*
 * Send an invitation to a player to a match
 * sender and reciever must be players
 */
async function invitePlayerToMatch(ctx, sender, receiver, match){
  await sendNotification(ctx, sender, receiver, {
    kind: 'playerInvitedToMatch',
    entityObj: sender,
    eventObj: match,
  });
  sendInvitationPlayerMail(ctx, receiver.email, {
    eventType: 'Partido',
    eventName: match.name,
    invitedBy: sender.getName(),
  });
}

/*
 *
 */
async function inviteTeamToMatch(ctx, sender, invitedTeam, teamCaptain, match){
  await sendNotification(ctx, sender, teamCaptain, {
    kind: 'teamInvitedToMatch',
    entityObj: invitedTeam,
    eventObj: match,
  });

  sendInvitationTeamMail(ctx, teamCaptain.email, {
    eventType: 'Partido',
    eventName: match.name,
    invitedBy: sender.getName(),
    teamName: invitedTeam.name,
  });
}

/*
 * sender and reciever are players
 */
async function invitePlayerToTeam(ctx, sender, receiver, team){
  await sendNotification(ctx, sender, receiver, {
    kind: 'addedToTeam',
    entityObj: sender,
    eventObj: team,
  });

  sendInvitationPlayerMail(ctx, receiver.email, {
    eventType: 'Equipo',
    eventName: team.name,
    invitedBy: sender.getName(),
  });
}

/*
 * sender is a player, receivers is a list of players
 */
function teamAcceptMatch(ctx, sender, receivers, team, match){
  return sendNotifications(ctx, sender, receivers, {
    kind: 'teamAcceptedMatch',
    entityObj: team,
    eventObj: match,
  });
}

/*
 * sender is a player, receivers is a list of players
 */
function playerAcceptMatch(ctx, sender, receivers, match){
  return sendNotifications(ctx, sender, receivers, {
    kind: 'playerAcceptedMatch',
    entityObj: sender,
    eventObj: match,
  });
}

/*
 * A player reserves a field
 */
async function reserveField(ctx, player, owner, field){
  await sendNotification(ctx, player, owner, {
    kind: 'playerReserveField',
    entityObj: player,
    eventObj: field,
  });

  sendFieldReservation(ctx, owner.email, {
    playerName: player.getName(),
    fieldName: field.name,
  });
}

/*
 * An owner accepts a field reservation
 */
function acceptFieldReservation(ctx, owner, matchAdmins, match, field){
  return sendNotifications(ctx, owner, matchAdmins, {
    kind: 'ownerAcceptFieldReservation',
    entityObj: field,
    eventObj: match,
  });
}

module.exports = {
  invitePlayerToMatch,
  inviteTeamToMatch,
  invitePlayerToTeam,
  teamAcceptMatch,
  playerAcceptMatch,
  reserveField,
  acceptFieldReservation
};
