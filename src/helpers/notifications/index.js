const buttonHelpers = require('./buttons');
const sendHelpers = require('./send');

module.exports = function notificationHelpers(app) {
  buttonHelpers(app);
  sendHelpers(app);
};
