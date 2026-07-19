const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Create Nodemailer Transporter
const createTransporter = () => {
  const user = process.env.SMTP_USER || 'deepakbhee2006@gmail.com';
  const pass = (process.env.SMTP_PASS || 'fqpr sual utjs sgig').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false // Allows cloud environments (Render/AWS) to pass TLS handshakes
    }
  });
};

// Send Email Notification
const sendEmailNotification = async (toEmail, subject, text, html) => {
  const user = process.env.SMTP_USER || 'deepakbhee2006@gmail.com';
  const pass = (process.env.SMTP_PASS || 'fqpr sual utjs sgig').replace(/\s+/g, '');

  if (!user || !pass) {
    console.log('⚠️ SMTP credentials not set. Skipping real Email dispatch.');
    return false;
  }

  if (!toEmail) {
    console.log('⚠️ Recipient email missing. Skipping email send.');
    return false;
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"JaldiKharidoo Store" <${user}>`,
      to: toEmail,
      subject,
      text,
    };
    if (html) mailOptions.html = html;

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email Notification sent to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ Real Email sending to ${toEmail} failed:`, err.message);
    return false;
  }
};

// Send SMS Notification
const sendSmsNotification = async (toPhone, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('⚠️ Twilio parameters not set. Skipping real SMS dispatch.');
    return false;
  }

  if (!toPhone) {
    console.log('⚠️ Recipient phone missing. Skipping SMS send.');
    return false;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone
    });
    console.log(`📱 SMS Notification sent to ${toPhone}: SID ${response.sid}`);
    return true;
  } catch (err) {
    console.error(`❌ Real SMS sending to ${toPhone} failed:`, err.message);
    return false;
  }
};

module.exports = { sendEmailNotification, sendSmsNotification };
