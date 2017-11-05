const moment = require('moment');
const _ = require('lodash');
const permissionHelpers = require('./permissions');
const matchHelpers = require('./matches');
const teamHelpers = require('./teams');
const invitationHelpers = require('./invitations');
const commentHelpers = require('./comments');

// NOTE:
// See https://github.com/embbnux/kails (koa in rails style) for examples on helper functions
module.exports = function helpers(app) {
  /** Wrapper to find an entity (match, team, player, etc) by the id and assert that is not null **/
  app.context.findById = async function(model, id) {
    const entity = await model.findById(id);
    this.assert(entity, 404);
    return entity;
  };

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

  app.context.prettyTimestamp = function(date){
    const parsedDate = moment(date);
    return parsedDate.isValid() ? parsedDate.format('YYYY-MMM-d H:mm') : '';
  }

  /** Wrappers to get a pretty timestamp **/
  app.context.createdAtTimestamp = function(element){
    return this.prettyTimestamp(element.createdAt);
  }
  app.context.updatedAtTimestamp = function(element){
    return this.prettyTimestamp(element.updatedAt);
  }

  permissionHelpers(app);
  matchHelpers(app);
  teamHelpers(app);
  invitationHelpers(app);
  commentHelpers(app);
};
