import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_SMTP_HOST || 'localhost',
  port: Number(process.env.MAILHOG_SMTP_PORT || 1025),
  secure: false
});

export default transporter;