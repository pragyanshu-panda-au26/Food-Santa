const nodemailer = require('nodemailer')
require('dotenv').config()

const sendemail = async(option) => {
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        port: 2525,
        auth: {
            user: process.env.smtp_user,
            pass: process.env.smtp_pass
        }
    });

    const message = {
        from: '"PASSWORD RESET FOOD-SANTA"<prag2468@outlook.com>', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        // html: `<b>Password reset link</b> <a href=localhost:4000/${option.message}>Click here</a>`,
        text: option.message,
    };
    await transporter.sendMail(message);

}

module.exports = sendemail