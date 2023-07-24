const nodemailer = require('nodemailer');
//const AppError = require('./appError');
//const { getMaxListeners } = require('../models/userModel');
//const catchAsync = require('./catchAsync');
const pug = require('pug');
const { convert } = require('html-to-text');
const mailgun = require('mailgun-js');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ankit Singh <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') return 1;

    return mailgun({
      apiKey: process.env.MAILGUN_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    });
    /*     return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    }); */
  }

  async send(template, subject) {
    // to actually sending the email

    // render the html of template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //define the options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
      // html:
    };

    //create transport and send email
    await this.newTransport()
      .messages()
      .send(mailOptions, (error, body) => {
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Email sent:', body);
        }
      });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Reset your password');
  }
};
