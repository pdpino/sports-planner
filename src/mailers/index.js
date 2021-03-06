const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

module.exports = function mailers(app) {
  const transport = nodemailer.createTransport(emailConfig.provider, emailConfig.defaults);
  // eslint-disable-next-line no-param-reassign
  app.context.sendMail = async function sendMail(emailName, options, templateContext) {
    console.log(`MAILERS: emailName: ${emailName}, options: ${options.toString()}`); // DEBUG
    const html = await this.render(
      `emails/${emailName}`,
      { ...templateContext,
        homeLink: this.request.origin,
        layout: false,
        writeResp: false,
      },
    );
    return transport.sendMail({ ...options, html });
  };
};
