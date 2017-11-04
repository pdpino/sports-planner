module.exports = function permissions(app) {
  app.context.requireAdmin = function(){
    this.assert(this.state.hasAdminPermission, 404, "Debes ser admin", {});
  }

  app.context.requirePlayerLoggedIn = function(){
    this.assert(this.state.isPlayerLoggedIn, 403, "Debes ser jugador", {});
  }

  app.context.requireOwnerLoggedIn = function(){
    this.assert(this.state.isOwnerLoggedIn, 403, "Debes ser dueño de recinto", {});
  }

  app.context.requireNoLogin = function(){
    this.assert(!this.state.isLoggedIn, 403, "Ya iniciaste sesión", {});
  }

  app.context.requireModifyPermission = function(userId){
    this.assert(this.state.hasModifyPermission(this, userId), 403, "No tienes permisos");
  }

  app.context.requireOwnerModifyPermission = function(owner){
    this.assert(this.state.hasOwnerModifyPermission(this, owner), 403, "No tienes permisos");
  }

  /** Require permission of the player with a match or team (called entity) **/
  app.context.requirePlayerModifyPermission = async function(entity){
    // REFACTOR: this function could be merged with requireModifyPermission and requireOwnerModifyPermission
    // compound and field would need a method entity.hasModifyPermission()
    // (maybe two versions: async and sync)
    const hasModifyPermission = await entity.hasModifyPermission(this.state.currentPlayer);
    this.assert(hasModifyPermission, 403, "No tienes permisos");
  }

};
