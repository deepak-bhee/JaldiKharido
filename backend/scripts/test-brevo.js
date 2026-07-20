require('dotenv').config();
const { sendBrevoEmail } = require('../utils/notifier');

async function testBrevo() {
  const apiKey = process.argv[2] || process.env.BREVO_API_KEY;
  if (apiKey) {
    process.env.BREVO_API_KEY = apiKey;
  }

  const targetEmail = process.argv[3] || 'deepakbhee2006@gmail.com';
  console.log(`Testing Brevo API Email dispatch to ${targetEmail}...`);

  const result = await sendBrevoEmail({
    to: targetEmail,
    subject: 'JaldiKharidoo — Brevo API Integration Test 🚀',
    text: 'Your Brevo API email setup is working 100% successfully!',
    html: '<h2 style="color: #f97316;">JaldiKharidoo ⚡</h2><p>Your Brevo API email integration is working 100% successfully for ALL users! 🎉</p>'
  });

  console.log('Result:', result ? 'BREVO EMAIL SENT SUCCESSFULLY ✅' : 'BREVO EMAIL FAILED / CHECK API KEY ❌');
}

testBrevo();
