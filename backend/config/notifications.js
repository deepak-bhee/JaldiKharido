const getNotificationStatus = () => ({
  email: Boolean(process.env.RESEND_API_KEY),
  provider: 'Resend',
});

const logNotificationStatus = () => {
  const status = getNotificationStatus();
  console.log('\n📬 Notification configuration:');
  console.log(`   Email (Resend REST API): ${status.email ? '✅ configured' : '❌ missing RESEND_API_KEY'}`);
  if (!status.email) {
    console.log('   ⚠️  Set RESEND_API_KEY in Render Dashboard → Environment.');
  }
};

module.exports = { getNotificationStatus, logNotificationStatus };
