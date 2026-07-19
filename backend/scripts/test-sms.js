require('dotenv').config();
const { sendSmsNotification } = require('../utils/notifier');

async function testSms() {
  const targetPhone = process.argv[2] || '+919844834494';
  console.log(`Testing Twilio SMS dispatch to ${targetPhone}...`);
  const result = await sendSmsNotification(
    targetPhone,
    'JaldiKharidoo: Your test order alert is working! 🚀'
  );
  console.log('Result:', result ? 'SMS SENT SUCCESSFULLY ✅' : 'SMS DISPATCH FAILED / SKIPPED ❌');
}

testSms();
