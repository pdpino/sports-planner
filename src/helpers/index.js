const _ = require('lodash');
const permissionHelpers = require('./permissions');
const matchHelpers = require('./matches');
const teamHelpers = require('./teams');
const invitationHelpers = require('./invitations');

module.exports = function helpers(app) {
  /** Wrapper to find an entity (match, team, player, etc) by the id and assert that is not null **/
  app.context.findById = async function(model, id) {
    const entity = await model.findById(id);
    this.assert(entity, 404);
    return entity;
  };

  /** Wrapper to get one element of a many-associated model (hasMany or belongsToMany) **/
  app.context.findAssociatedById = async function(entity, getter, id) {
    // example: findAssociatedById(match, 'getPlayers', playerId)
    const elements = await entity[getter]({ where: { id } });
    return (elements.length === 1) ? elements[0] : null;

    // NOTE: if the getter is a function instead of a string, then this should be done first:
    // const bindedGetter = getter.bind(entity);
  }

  /**
   * Wrapper to parse validation errors from sequelize
   * If the error is from the model: everything is ok with validationError.errors
   * If is from the DB: validationError.errors is undefined, (HACK) put it to an array in a object with a message (as if it came from the model)
   **/
  app.context.parseValidationError = function(validationError){
    const errorMessage = validationError.errors || [ { message: validationError.toString() } ];
    console.log("ERROR FOUND!: ", validationError);
    return errorMessage;
  }

  /**
   * Wrapper to get the difference of two collection of objects by its id
   */
  app.context.substract = function(collection1, collection2){
    return _.differenceBy(collection1, collection2, (element) => element.id);
  }

  permissionHelpers(app);
  matchHelpers(app);
  teamHelpers(app);
  invitationHelpers(app);
};
