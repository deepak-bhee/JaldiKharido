const { Resend } = require('resend');

/**
 * Send an email via Official Resend SDK
 */
const sendResendEmail = async ({ to, subject, text, html }) => {
  const apiKey = process.env.RESEND_API_KEY || 're_GH1FkXK9_2kE5xegxpXXj8RAicG92t8Ae';

  if (!apiKey) {
    console.log('⚠️ RESEND_API_KEY is missing in environment settings. Skipping email.');
    return false;
  }

  if (!to) {
    console.log('⚠️ No recipient email provided. Skipping email.');
    return false;
  }

  const recipient = to.toString().trim();
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'JaldiKharidoo <onboarding@resend.dev>';

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      subject,
      text,
      html
    });

    if (error) {
      console.error(`❌ Resend SDK Error for ${recipient}:`, error.message || error);
      return false;
    }

    console.log(`✉️ Resend Email delivered to ${recipient} (ID: ${data?.id})`);
    return true;
  } catch (err) {
    console.error(`❌ Resend SDK Exception for ${recipient}:`, err.message);
    return false;
  }
};

/**
 * Send order confirmation email to Customer & Admin via Resend ONLY
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
    emailTasks.push(sendResendEmail({ to: customerEmail, subject, text, html }));
  }
  if (adminEmail && adminEmail !== customerEmail) {
    emailTasks.push(sendResendEmail({ to: adminEmail, subject: `[ADMIN ALERT] New Order - #${shortId}`, text, html }));
  }

  if (emailTasks.length === 0) return false;

  const results = await Promise.allSettled(emailTasks);
  return results.some(r => r.status === 'fulfilled' && r.value === true);
};

module.exports = {
  sendResendEmail,
  sendOrderConfirmationEmail,
};
