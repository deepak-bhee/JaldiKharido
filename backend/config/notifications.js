const getNotificationStatus = () => ({
  email: Boolean(process.env.BREVO_API_KEY),
  provider: 'Brevo',
});

const logNotificationStatus = () => {
  const status = getNotificationStatus();
  console.log('\n📬 Notification configuration:');
  console.log(`   Email (Brevo HTTP API): ${status.email ? '✅ configured' : '❌ missing BREVO_API_KEY'}`);
  if (!status.email) {
    console.log('   ⚠️  Set BREVO_API_KEY in Render Dashboard → Environment.');
  }
};

module.exports = { getNotificationStatus, logNotificationStatus };
