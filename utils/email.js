const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
    constructor(user,url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.from = `Natours Web Team ${process.env.EMAIL_ADDRESS}`;
        this.url = url;
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production')
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user : process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template,subject) {
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'A warm welcome to Natours');
    }

    async sendReset() {
        await this.send('resetPassword', 'Reset Password (Valid for 10 minutes)');
    }
}

module.exports = Email;

// const sendEmail = async (options) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_ADDRESS,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });
//     const mailOptions = {
//         from: `Web Team ${process.env.EMAIL_ADDRESS}`,
//         to: `${options.name} <${options.target}>`,
//         subject: options.subject,
//         text: options.message
//     };
//     await transporter.sendMail(mailOptions);
// }

// module.exports = sendEmail;