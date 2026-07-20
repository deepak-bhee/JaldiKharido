require('dotenv').config();
const { sendEmailNotification } = require('../utils/notifier');

async function testResend() {
  const targetEmail = process.argv[2] || 'deepakbhee2006@gmail.com';
  console.log(`Testing Resend API Email dispatch to ${targetEmail}...`);
  const result = await sendEmailNotification(
    targetEmail,
    'JaldiKharidoo - Resend Test Order Alert 🚀',
    'Your order notification via Resend has been delivered successfully!'
  );
  console.log('Result:', result ? 'RESEND EMAIL SENT SUCCESSFULLY ✅' : 'RESEND EMAIL FAILED / MISSING KEY ❌');
}

testResend();
