const jsonApiSerializer = require('jsonapi-serializer');
const Sequelize = require('sequelize');

module.exports = function apiHelpers(app) {

  app.context.jsonSerializer = function jsonSerializer(type, options) {
    return new jsonApiSerializer.Serializer(type, options);
  };


};
