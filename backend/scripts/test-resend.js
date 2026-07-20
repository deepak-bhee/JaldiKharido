require('dotenv').config();
const { sendResendEmail } = require('../utils/notifier');

async function testResend() {
  const apiKey = process.argv[2] || process.env.RESEND_API_KEY;
  if (apiKey) {
    process.env.RESEND_API_KEY = apiKey;
  }

  const targetEmail = process.argv[3] || 'deepakbhee2006@gmail.com';
  console.log(`Testing Resend API Email dispatch to ${targetEmail}...`);

  const result = await sendResendEmail({
    to: targetEmail,
    subject: 'JaldiKharidoo — Resend API Integration Test 🚀',
    text: 'Your Resend API email setup is working 100% successfully!',
    html: '<h2 style="color: #f97316;">JaldiKharidoo ⚡</h2><p>Your Resend API email integration is working 100% successfully! 🎉</p>'
  });

  console.log('Result:', result ? 'RESEND EMAIL SENT SUCCESSFULLY ✅' : 'RESEND EMAIL FAILED / CHECK API KEY ❌');
}

testResend();
