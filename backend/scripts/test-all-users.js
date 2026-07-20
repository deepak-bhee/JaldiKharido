require('dotenv').config();
const { sendOrderConfirmationEmail } = require('../utils/notifier');

async function testAllUsers() {
  const dummyOrder = {
    _id: '6a4ea24759b2c45bf814ca99',
    totalAmount: 1499,
    paymentMethod: 'COD',
    user: { name: 'Customer Test' },
    items: [{ name: 'Premium Yoga Mat 6mm', quantity: 1, price: 1499 }]
  };

  const customerEmail = process.argv[2] || 'testcustomer99@gmail.com';
  console.log(`Testing order email dispatch to CUSTOMER (${customerEmail}) and ADMIN (deepakbhee2006@gmail.com)...`);

  const result = await sendOrderConfirmationEmail({
    order: dummyOrder,
    customerEmail: customerEmail,
    adminEmail: 'deepakbhee2006@gmail.com'
  });

  console.log('Result:', result ? 'EMAILS SENT TO ALL USERS SUCCESSFULLY ✅' : 'FAILED ❌');
}

testAllUsers();
