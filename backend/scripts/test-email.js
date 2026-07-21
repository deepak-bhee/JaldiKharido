require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sendEmailNotification } = require('../utils/notifier');

async function testEmail() {
  const targetEmail = process.argv[2] || process.env.ADMIN_EMAIL || 'deepakbhee2006@gmail.com';
  console.log(`⏳ Testing Resend API email dispatch to ${targetEmail}...`);

  const result = await sendEmailNotification(
    targetEmail,
    'JaldiKharidoo — Resend API Test Email 🚀',
    'Your Resend email dispatch system is working 100% perfectly!',
    '<h2 style="color: #f97316;">JaldiKharidoo ⚡</h2><p>Resend email delivery is working 100% perfectly! 🎉</p>'
  );

  console.log('Result:', result ? '✅ EMAIL SENT SUCCESSFULLY' : '❌ EMAIL FAILED');
}

testEmail();
