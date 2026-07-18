require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

console.log('🔍 Diagnostic details:');
console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '****** (length: ' + process.env.SMTP_PASS.length + ')' : 'MISSING'}`);

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ Error: SMTP_USER or SMTP_PASS is missing in your backend/.env file!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  timeout: 10000 // 10s timeout
});

console.log('\n⏳ Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Verification Failed!');
    console.error(error);
  } else {
    console.log('✅ SMTP Connection Verified Successfully! Your credentials are correct.');
    
    console.log('\n⏳ Sending test email...');
    transporter.sendMail({
      from: `"JaldiKharidoo Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'JaldiKharidoo Test Email 🚀',
      text: 'If you receive this, email notification setup is working perfectly!',
    }, (sendErr, info) => {
      if (sendErr) {
        console.error('❌ Test email sending failed:');
        console.error(sendErr);
      } else {
        console.log(`🎉 Test email sent successfully! MessageID: ${info.messageId}`);
        console.log(`Check your inbox at: ${process.env.SMTP_USER}`);
      }
    });
  }
});
