const nodemailer = require('nodemailer')

//The transporter is what is used to send the emails.
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: process.env.BREVO_SMTP_SECURE === "true",
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

module.exports = [transporter]
