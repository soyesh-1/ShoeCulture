const nodemailer = require("nodemailer");
const { env } = require("../config/env");

const buildTransporter = () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    throw new Error("SMTP config missing.");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    connectionTimeout: env.smtpTimeoutMs,
    greetingTimeout: env.smtpTimeoutMs,
    socketTimeout: env.smtpTimeoutMs,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
};

const sendEmail = async ({ to, subject, text }) => {
  const transporter = buildTransporter();
  const info = await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
  });
  return info;
};

module.exports = { sendEmail };
