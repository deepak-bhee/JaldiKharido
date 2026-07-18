const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Create Nodemailer Transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send Email Notification
const sendEmailNotification = async (toEmail, subject, text, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️ SMTP credentials not set. Skipping real Email dispatch.');
    return false;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"JaldiKharidoo Store" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
    });
    console.log(`✉️ Email Notification sent: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ Real Email sending failed:', err.message);
    return false;
  }
};

// Send SMS Notification
const sendSmsNotification = async (toPhone, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('⚠️ Twilio parameters not set. Skipping real SMS dispatch.');
    return false;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone
    });
    console.log(`📱 SMS Notification sent: SID ${response.sid}`);
    return true;
  } catch (err) {
    console.error('❌ Real SMS sending failed:', err.message);
    return false;
  }
};

module.exports = { sendEmailNotification, sendSmsNotification };
