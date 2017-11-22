module.exports = function permissionHelpers(app) {
  app.context.hasAdminPermission = function(){
    return this.state.currentUser && this.state.currentUser.isAdmin();
  }

  /** Has modify permission over the person (player or owner) **/
  app.context.hasModifyPermission = function(person){
    return this.state.currentUser && this.state.currentUser.id === person.userId;
  }

  app.context.hasUserModifyPermission = function(user){
    return this.state.currentUser && this.state.currentUser.id === user.id;
  }

  app.context.requireAdmin = function(){
    this.assert(this.hasAdminPermission(), 401, 'No eres administrador', {});
  }

  app.context.requireLoggedIn = function(){
    this.assert(this.state.isLoggedIn, 401, 'Debes hacer login', {});
  }

  app.context.requirePlayerLoggedIn = function(){
    this.assert(this.state.isPlayerLoggedIn, 403, 'Debes ser jugador', {});
  }

  app.context.requireOwnerLoggedIn = function(){
    this.assert(this.state.isOwnerLoggedIn, 403, 'Debes ser dueño de recinto', {});
  }

  app.context.requireNoLogin = function(){
    this.assert(!this.state.isLoggedIn, 403, 'Ya iniciaste sesión', {});
  }

  /** Person may be a player or compoundOwner **/
  app.context.requireModifyPermission = function(person){
    this.assert(this.hasModifyPermission(person), 401, 'No tienes permisos');
  }

  app.context.requireUser = function(user){
    this.assert(this.hasUserModifyPermission(user), 401, 'No tienes permisos');
  }

  app.context.requireOwnerModifyPermission = function(owner){
    this.assert(this.state.isOwnerLoggedIn && this.hasModifyPermission(owner), 401,
      'No tienes permisos');
  }

  /** Require permission of the player with a match or team (called entity) **/
  app.context.requirePlayerModifyPermission = async function(entity){
    const hasModifyPermission = await entity.hasModifyPermission(this.state.currentPlayer);
    this.assert(hasModifyPermission, 401, 'No tienes permisos');
  }

};
