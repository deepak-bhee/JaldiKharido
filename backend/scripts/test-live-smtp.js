require('dotenv').config();
const { sendEmailNotification } = require('../utils/notifier');

async function testSmtp() {
  console.log('Testing Nodemailer Gmail SMTP connection...');
  const result = await sendEmailNotification(
    'deepakbhee2006@gmail.com',
    'JaldiKharidoo - Order Notification Test',
    'This is a test notification from your JaldiKharidoo store.'
  );
  console.log('Result:', result ? 'SUCCESS ✅' : 'FAILED ❌');
}

testSmtp();
