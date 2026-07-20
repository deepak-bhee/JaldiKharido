const getNotificationStatus = () => ({
  email: Boolean(process.env.RESEND_API_KEY),
  provider: 'Resend',
});

const logNotificationStatus = () => {
  const status = getNotificationStatus();
  console.log('\n📬 Notification configuration:');
  console.log(`   Email (Resend API): ${status.email ? '✅ configured' : '❌ missing RESEND_API_KEY'}`);
  if (!status.email) {
    console.log('   ⚠️  Critical: You need to add a RESEND_API_KEY in your Render Dashboard → Environment → Add Environment Variable');
    console.log('      Visit https://dashboard.render.com to set this secret for your E-commerece service');
  }
};

module.exports = { getNotificationStatus, logNotificationStatus };
