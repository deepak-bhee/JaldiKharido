require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sendOrderStatusUpdateEmail } = require('../utils/notifier');

async function testStatusEmail() {
  const targetEmail = process.argv[2] || process.env.ADMIN_EMAIL || 'deepakbhee2006@gmail.com';
  const mockOrder = {
    _id: '6a5e657bdcc0dd76db578627',
    totalAmount: 1499,
    paymentMethod: 'COD',
    user: { name: 'Deepak Test' }
  };

  console.log(`⏳ Testing Resend status update email to ${targetEmail}...`);

  const shippedRes = await sendOrderStatusUpdateEmail({
    order: mockOrder,
    customerEmail: targetEmail,
    status: 'shipped'
  });
  console.log(`🚚 Shipped Email Result:`, shippedRes ? '✅ DELIVERED' : '❌ FAILED');

  const deliveredRes = await sendOrderStatusUpdateEmail({
    order: mockOrder,
    customerEmail: targetEmail,
    status: 'delivered'
  });
  console.log(`🎉 Delivered Email Result:`, deliveredRes ? '✅ DELIVERED' : '❌ FAILED');
}

testStatusEmail();
