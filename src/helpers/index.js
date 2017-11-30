const moment = require('moment');
const _ = require('lodash');
const permissionHelpers = require('./permissions');
const matchHelpers = require('./matches');
const teamHelpers = require('./teams');
const invitationHelpers = require('./invitations');
const notificationHelpers = require('./notifications');
const commentHelpers = require('./comments');

// NOTE:
// See https://github.com/embbnux/kails (koa in rails style) for examples on helper functions
module.exports = function helpers(app) {
  app.context.login = async function(email, password){
    const user = await this.orm.user.find({ where: { email } });
    if (user) {
      const isPasswordCorrect = await user.checkPassword(password);
      if (isPasswordCorrect) {
        this.session.userId = user.id;
        return this.redirect('/'); // HACK: can't use home path
      }
    }
    return false;
  }

  app.context.loadCurrentUser = async function(sessionObject) {
    // Load user and (player or owner)
    const currentUser = sessionObject.userId && await this.orm.user.findById(sessionObject.userId);
    let currentPlayer;
    let currentOwner;

    if (currentUser){
      if (currentUser.isPlayer()){
        currentPlayer = await currentUser.getPlayer();
      }
      else if (currentUser.isCompoundOwner()){
        currentOwner = await currentUser.getCompoundOwner();
      }
    } else {
      sessionObject.userId = 0; // Close session when no player found (e.g. old cookie)
    }

    Object.assign(this.state, {
      currentUser,
      currentPlayer,
      currentOwner,
      isLoggedIn: Boolean(currentUser),
      isPlayerLoggedIn: Boolean(currentPlayer),
      isOwnerLoggedIn: Boolean(currentOwner),
      isAdminLoggedIn: this.hasAdminPermission(),
    });
  }

  /** Filter params on ctx.request.body (or fields or files, according to content-type) with whiteList **/
  app.context.getParams = function(whiteList){
    let paramsObject = {};

    if (this.request.headers['content-type'].startsWith('multipart')) {
      Object.assign(paramsObject, this.request.body.fields, this.request.body.files);
      // NOTE: it is assumed that this does not copy the files
    } else {
      Object.assign(paramsObject, this.request.body);
    }

    return _.pick(paramsObject, ...whiteList);
  }

  /**
   * Get the url like: 'http(s)://host(:port)/path/to/resource'
   * Used to display links in the emails
   */
  app.context.getFullUrl = function(name, params){
    // REVIEW: koa-router has a method for this?
    const origin = this.request.origin;
    const url = this.router.url(name, params);
    return `${origin}${url}`;
  }

  /** Wrapper to find an entity (match, team, player, etc) by the id and assert that is not null **/
  app.context.findById = async function(model, id) {
    const entity = await model.findById(id);
    this.assert(entity, 404);
    return entity;
  };

  /** FUTURE: Wrapper to accept html and json **/
  // app.context.acceptFormats = function(callbackHtml, callbackJson){
  //   switch (this.accepts('html', 'json')) {
  //     case 'html':
  //       callbackHtml();
  //       break;
  //     case 'json':
  //       callbackJson();
  //       break;
  //     default:
  //   }
  // }

  /**
   * Wrapper to parse validation errors from sequelize
   * If the error is from the model: everything is ok with validationError.errors
   * If is from the DB: validationError.errors is undefined, (HACK) put it to an array in a object with a message (as if it came from the model)
   **/
  app.context.parseValidationError = function(validationError){
    const errorMessages = validationError.errors || [ { message: validationError.toString() } ];
    console.log("ERROR FOUND!: ", validationError);
    return errorMessages;
  }

  /**
   * Wrapper to get the difference of two collection of objects by its id
   */
  app.context.substract = function(collection1, collection2){
    return _.differenceBy(collection1, collection2, (element) => element.id);
  }

  app.context.parseDate = function(date, format){
    const parsedDate = moment(date);
    if (!parsedDate.isValid()){
      // DEBUG
      console.log("WARNING: parseDate got invalid date: ", date);
      return '';
    }
    return format ? parsedDate.format(format) : parsedDate;
  }

  app.context.prettyTimestamp = function(date){
    return this.parseDate(date, 'YYYY-MMM-D H:mm');
  }

  app.context.prettyDatestamp = function(date){
    return this.parseDate(date, 'YYYY-MMM-D');
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
  notificationHelpers(app);
  commentHelpers(app);
};
