/* eslint no-console: "off" */
const _ = require('lodash');
const http = require('http');
const apps = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 3000;

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
    const callbacks = _.mapValues(apps, app => app.callback());
    http.createServer((req, res) => {
      if (req.url.startsWith('/api')) {
        callbacks.api(req, res);
      } else {
        callbacks.ui(req, res);
      }
    }).listen(PORT, (err) => {
      if (err) {
        return console.error('Failed', err);
      }
      console.log(`Listening on port ${PORT}`);
      return null;
    });
  })
  .catch(err => console.error('Unable to connect to the database:', err));
