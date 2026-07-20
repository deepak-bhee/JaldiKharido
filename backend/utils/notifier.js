// Brevo (Sendinblue) Transactional Email Notification Service (REST API)

/**
 * Send an email via Brevo REST API
 */
const sendBrevoEmail = async ({ to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log('⚠️ BREVO_API_KEY is missing in environment settings. Skipping email.');
    return false;
  }

  if (!to) {
    console.log('⚠️ No recipient email provided. Skipping email.');
    return false;
  }

  const recipientEmail = to.toString().trim();
  const senderEmail = process.env.SMTP_USER || 'deepakbhee2006@gmail.com';
  const senderName = process.env.SENDER_NAME || 'JaldiKharidoo';

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [
          {
            email: recipientEmail
          }
        ],
        subject,
        textContent: text,
        htmlContent: html
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✉️ Brevo Email delivered to ${recipientEmail} (ID: ${data.messageId || data.id})`);
      return true;
    } else {
      console.error(`❌ Brevo API Error for ${recipientEmail}:`, data.message || JSON.stringify(data));
      return false;
    }
  } catch (err) {
    console.error(`❌ Brevo HTTP Request Exception for ${recipientEmail}:`, err.message);
    return false;
  }
};

/**
 * Send order confirmation emails to Customer & Admin via Brevo
 */
const sendOrderConfirmationEmail = async ({ order, customerEmail, adminEmail }) => {
  const orderId = order._id.toString();
  const shortId = orderId.substring(0, 8);
  const totalAmount = order.totalAmount || 0;
  const paymentMethod = order.paymentMethod || 'COD';
  const customerName = order.user?.name || 'Valued Customer';

  const subject = `Order Confirmed! #${shortId} — JaldiKharidoo 🚀`;
  const text = `Hi ${customerName},\n\nYour order #${orderId} has been placed successfully!\nTotal Amount: ₹${totalAmount}\nPayment Method: ${paymentMethod}\n\nThank you for shopping with JaldiKharidoo!`;

  const itemsListHtml = (order.items || []).map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: 600; color: #1e293b;">${item.name || 'Product'}</td>
      <td style="padding: 12px; text-align: center; color: #64748b;">x${item.quantity}</td>
      <td style="padding: 12px; text-align: right; font-weight: 700; color: #f97316;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f97316; margin: 0; font-size: 26px; font-weight: 800;">JaldiKharidoo ⚡</h1>
        <p style="color: #64748b; margin-top: 4px; font-size: 14px;">India's Fastest Delivery</p>
      </div>

      <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="color: #c2410c; margin: 0 0 6px 0; font-size: 18px;">Order Placed Successfully! 🎉</h2>
        <p style="margin: 0; font-size: 14px; color: #9a3412;">Hi <strong>${customerName}</strong>, thank you for your order. We are getting your package ready!</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f8fafc; text-align: left;">
            <th style="padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b;">Item</th>
            <th style="padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: center;">Qty</th>
            <th style="padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
        </tbody>
      </table>

      <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #64748b;">
          <span>Payment Method:</span>
          <strong style="color: #1e293b;">${paymentMethod}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #1e293b; border-t: 1px solid #e2e8f0; pt: 8px;">
          <span>Total Paid:</span>
          <span style="color: #f97316;">₹${totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; pt: 16px;">
        <a href="https://jaldi-kharido.vercel.app/orders" style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px;">Track Your Order</a>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">JaldiKharidoo Store • Thank you for shopping with us!</p>
      </div>
    </div>
  `;

  const emailTasks = [];
  if (customerEmail) {
    emailTasks.push(sendBrevoEmail({ to: customerEmail, subject, text, html }));
  }
  if (adminEmail && adminEmail !== customerEmail) {
    emailTasks.push(sendBrevoEmail({ to: adminEmail, subject: `[ADMIN ALERT] New Order - #${shortId}`, text, html }));
  }

  if (emailTasks.length === 0) return false;

  const results = await Promise.allSettled(emailTasks);
  return results.some(r => r.status === 'fulfilled' && r.value === true);
};

module.exports = {
  sendBrevoEmail,
  sendOrderConfirmationEmail,
};
