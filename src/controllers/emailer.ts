import mailgunFactory from 'mailgun-js';
import Composer from 'nodemailer/lib/mail-composer';

const apiKey = 'fa6e84b7-945da187';


const domain = ''; // TODO


const mailgun = mailgunFactory({apiKey, domain});

// TODO https://www.npmjs.com/package/mailgun-js
// https://www.mailgun.com/blog/how-to-send-transactional-email-in-a-nodejs-app-using-the-mailgun-api/

// https://nodemailer.com/message/

var mailOptions = {
  from: 'you@samples.mailgun.org',
  to: 'mm@samples.mailgun.org',
  subject: 'Test email subject',
  text: 'Test email text',
  html: '<b> Test email text </b>'
};
 
export const send = () => {
    new Composer(mailOptions).compile().build((err, message) => {
      var dataToSend = {
          to: 'mm@samples.mailgun.org',
          message: message.toString('ascii')
      };
      mailgun.messages().send(dataToSend, (err, body) => {
          if (err) {
              console.log(err);
              return;
          }
      });
    });
};