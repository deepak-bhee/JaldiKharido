// Resend Email Notification Utility (No SMTP / No SMS dependencies)

const sendEmailNotification = async (toEmail, subject, text, html) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('⚠️ RESEND_API_KEY not configured. Skipping email dispatch.');
    return false;
  }

  if (!toEmail) {
    console.log('⚠️ Recipient email missing. Skipping email send.');
    return false;
  }

  // Resend default onboarding sender (or custom domain if configured)
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'JaldiKharidoo <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject,
        text,
        html
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✉️ Resend Email sent to ${toEmail} (ID: ${data.id})`);
      return true;
    } else {
      console.error(`❌ Resend Email to ${toEmail} failed:`, data.message || JSON.stringify(data));
      return false;
    }
  } catch (err) {
    console.error(`❌ Resend API request error:`, err.message);
    return false;
  }
};

const dispatchOrderNotifications = async ({
  customerEmail,
  adminEmail,
  emailSubject,
  adminEmailSubject,
  emailText,
  emailHtml,
}) => {
  const tasks = [];

  if (customerEmail) {
    tasks.push(sendEmailNotification(customerEmail, emailSubject, emailText, emailHtml));
  }
  if (adminEmail && adminEmail !== customerEmail) {
    tasks.push(
      sendEmailNotification(adminEmail, adminEmailSubject || emailSubject, emailText, emailHtml)
    );
  }

  if (tasks.length === 0) {
    console.log('⚠️ No email targets for this order.');
    return;
  }

  const results = await Promise.allSettled(tasks);
  const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
  console.log(`📬 Resend order notifications finished: ${succeeded}/${tasks.length} succeeded`);
};

module.exports = {
  sendEmailNotification,
  dispatchOrderNotifications,
};
