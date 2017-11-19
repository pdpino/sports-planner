const jsonApiSerializer = require('jsonapi-serializer');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaLogger = require('koa-logger');
const routes = require('./api-routes');
const orm = require('./models');
// const override = require('koa-override-method');
// const mailer = require('./mailers');
// const helpers = require('./helpers');


// App constructor
const app = new Koa();

// expose ORM through context's prototype
app.context.orm = orm;

app.context.jsonSerializer = function jsonSerializer(type, options) {
  return new jsonApiSerializer.Serializer(type, options);
};

/**
 * Middlewares
 */

 // expose running mode in ctx.state
 app.use((ctx, next) => {
   ctx.state.env = ctx.app.env;
   return next();
 });

 // log requests
 app.use(koaLogger());

 // parse request body
 app.use(koaBody({
   multipart: true,
   keepExtensions: true,
 }));

 // Routing middleware
 app.use(routes.routes());

 module.exports = app;
