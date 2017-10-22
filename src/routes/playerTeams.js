const KoaRouter = require('koa-router');

const router = new KoaRouter();

// NOTE: everything is commented because the only thing that a player can do is to exit a team

// /** Boolean if searchedTeam is in playTeams **/
// function isOneOfMyTeams(searchedTeam, playerTeams){
//   return Boolean(playerTeams.find((team) => team.id == searchedTeam.id));
// }
//
// /** Return the joinable teams, allTeams minus playerTeams **/
// function getJoinableTeams(allTeams, playerTeams){
//   // OPTIMIZE ???
//   return allTeams.filter( (anyTeam) => {
//     return !isOneOfMyTeams(anyTeam, playerTeams);
//   });
// }
//
// /** Wrapper to find a playerTeam given its id **/
// async function findPlayerTeamById(player, teamId){
//   const playerTeams = await player.getTeams( { where: { id: teamId } } );
//   return (playerTeams.length == 1) ? playerTeams[0] : null;
// }
//
// router.get('playerTeamNew', '/new', async (ctx) => {
//   await ctx.render('playerTeams/new', {
//     player: ctx.state.player,
//     joinableTeams: getJoinableTeams(ctx.state.teams, ctx.state.playerTeams),
//     submitPlayerTeamPath: ctx.router.url('playerTeamCreate', { playerId: ctx.state.player.id }),
//     cancelPath: ctx.router.url('player', ctx.state.player.id)
//   });
// });
//
// router.post('playerTeamCreate', '/', async (ctx) => {
//   try {
//     await ctx.state.player.addTeam(ctx.request.body.teamId, {
//       through: { isCaptain: ctx.request.body.isCaptain }
//     });
//     ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
//   } catch (validationError) {
//     await ctx.render('playerTeams/new', {
//       player: ctx.state.player,
//       joinableTeams: getJoinableTeams(ctx.state.teams, ctx.state.playerTeams),
//       errors: ctx.state.parseValidationError(validationError),
//       submitPlayerTeamPath: ctx.router.url('playerTeamCreate', { playerId: ctx.state.player.id }),
//       cancelPath: ctx.router.url('player', ctx.state.player.id)
//     });
//   }
// });
//
// router.get('playerTeamEdit', '/:id/edit', async (ctx) => {
//   const playerTeam = await findPlayerTeamById(ctx.state.player, ctx.params.id);
//   if (!playerTeam){
//     console.log("WARNING: passed to playerTeamEdit and didn't find any playerTeam"); // DEBUG
//     // REVIEW: notify the user?
//     return ctx.redirect('/'); // HACK: can't use 'home' url
//   }
//   await ctx.render('playerTeams/edit', {
//     player: ctx.state.player,
//     playerTeam,
//     submitPlayerTeamPath: ctx.router.url('playerTeamUpdate', {
//       playerId: ctx.state.player.id,
//       id: playerTeam.id
//     }),
//     deletePlayerTeamPath: ctx.router.url('playerTeamDelete', {
//       playerId: ctx.state.player.id,
//       id: playerTeam.id
//     }),
//     cancelPath: ctx.router.url('player', ctx.state.player.id)
//   });
// });
//
// router.patch('playerTeamUpdate', '/:id', async (ctx) => {
//   const playerTeam = await findPlayerTeamById(ctx.state.player, ctx.params.id);
//   try {
//     await ctx.state.player.addTeam(playerTeam, {
//       through: { isCaptain: ctx.request.body.isCaptain }
//     });
//     ctx.redirect(ctx.router.url('player', { id: ctx.state.player.id }));
//   } catch (validationError) {
//     await ctx.render('playerTeams/edit', {
//       player: ctx.state.player,
//       playerTeam,
//       errors: ctx.state.parseValidationError(validationError),
//       submitPlayerTeamPath: ctx.router.url('playerTeamUpdate', {
//         playerId: ctx.state.player.id,
//         id: playerTeam.id
//       }),
//       deletePlayerTeamPath: ctx.router.url('playerTeamDelete', {
//         playerId: ctx.state.player.id,
//         id: playerTeam.id
//       }),
//       cancelPath: ctx.router.url('player', ctx.state.player.id)
//     });
//   }
// });

router.delete('playerTeamDelete', '/:id', async (ctx) => {
   await ctx.state.player.removeTeam(ctx.params.id);
   ctx.redirect(ctx.router.url('player', ctx.state.player.id));
 });


module.exports = router;
