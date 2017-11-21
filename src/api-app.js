const Koa = require('koa');
const koaBody = require('koa-body');
const koaLogger = require('koa-logger');
const routes = require('./api-routes');
const orm = require('./models');
const helpers = require('./helpers');
const apiHelpers = require('./helpers/api');
// const override = require('koa-override-method');
// const mailer = require('./mailers');


// App constructor
const app = new Koa();

// expose ORM through context's prototype
app.context.orm = orm;

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


// NOTE: this is a total overkill, is loading all helpers into this app
// Later the helpers should be picked (when you know all the useful ones (for the API))
helpers(app);
apiHelpers(app);

// Handle errors
app.use(async (ctx, next) => {
  try{
    await next();
  } catch(error) {
    console.log("ERROR RECEIVED IN API: ", error); // DEBUG
    if (error.name === 'NotFoundError') {
      ctx.body = {
        message: error.message,
        details: error.details
      };
    } else if (error.name === 'UnauthorizedError') {
      ctx.body = {
        message: 'No tienes autorización',
        details: error.message
      };
    } else {
      console.log("ERROR NOT RECOGNIZED"); // DEBUG
      throw error; // Upper middleware can handle it
    }

  }
});

// Routing middleware
app.use(routes.routes());

module.exports = app;
