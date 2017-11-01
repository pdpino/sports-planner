const sendInvitationPlayerMail = require('../mailers/invitation-player');
const sendInvitationTeamMail = require('../mailers/invitation-team');
const sendFieldReservation = require('../mailers/reservation-field');

/*
 * NOTE: functions receive the context to comply to a standard and because they may be moved to the ctx.state in the future
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
async function sendNotification(ctx, sender, receiver, options){
  await ctx.orm.notification.create({
    ...options,
    wasRead: false,
    senderId: sender.userId,
    receiverId: receiver.userId,
  });
}

/*
 * Send an invitation to a player to a match
 * sender and reciever must be players
 */
async function invitePlayerToMatch(ctx, sender, receiver, match){
  const senderFullName = sender.getName();

  await sendNotification(ctx, sender, receiver, {
    kind: 'playerInvitedToMatch',
    entityName: senderFullName,
    eventName: match.name,
  });
  sendInvitationPlayerMail(ctx, receiver.email, {
    eventType: 'Partido',
    eventName: match.name,
    invitedBy: senderFullName,
  });
}

/*
 *
 */
async function inviteTeamToMatch(ctx, sender, invitedTeam, teamCaptain, match){
  await sendNotification(ctx, sender, teamCaptain, {
    kind: 'teamInvitedToMatch',
    entityName: invitedTeam.name,
    eventName: match.name,
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
  const senderName = sender.getName();

  await sendNotification(ctx, sender, receiver, {
    kind: 'addedToTeam',
    entityName: senderName,
    eventName: team.name,
  });

  sendInvitationPlayerMail(ctx, receiver.email, {
    eventType: 'Equipo',
    eventName: team.name,
    invitedBy: senderName,
  });
}

/*
 * sender is a player, receivers is a list of players
 */
async function teamAcceptMatch(ctx, sender, receivers, team, match){
  receivers.forEach(async (receiver) => {
    await sendNotification(ctx, sender, receiver, {
      kind: 'teamAcceptedMatch',
      entityName: team.name,
      eventName: match.name,
    });
  });
}

/*
 * sender is a player, receivers is a list of players
 */
async function playerAcceptMatch(ctx, sender, receivers, match){
  receivers.forEach(async (receiver) => {
    await sendNotification(ctx, sender, receiver, {
      kind: 'playerAcceptedMatch',
      entityName: sender.getName(),
      eventName: match.name,
    });
  });
}

/*
 * A player asks for a field
 */
async function reserveField(ctx, player, owner, field){
  const playerName = player.getName();

  await sendNotification(ctx, player, owner, {
    kind: 'playerReserveField',
    entityName: playerName,
    eventName: field.name,
  });

  sendFieldReservation(ctx, owner.email, {
    playerName,
    fieldName: field.name,
  });
}

/*
 * An owner accepts a field reservation
 */
async function acceptFieldReservation(ctx, owner, matchAdmins, match, field){
  matchAdmins.forEach(async (matchAdmin) => {
    await sendNotification(ctx, owner, matchAdmin, {
      kind: 'ownerAcceptFieldReservation',
      entityName: field.name,
      eventName: match.name,
    });
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
