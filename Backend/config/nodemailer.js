import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,  // SMTP login email
    pass: process.env.SMTP_PASS,  // SMTP password/key
  }
});

export default transporter;
