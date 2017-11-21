// const moment = require('moment');
// const _ = require('lodash');
const serializerHelpers = require('./serializers');

module.exports = function helpers(app) {
  app.context.respondApi = function(message) {
    this.body = {
      data: message,
    }
  }

  serializerHelpers(app);
};
