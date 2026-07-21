/**
 * Resend Email Notification Service (HTTPS REST API)
 * Sends emails directly via Resend API (https://api.resend.com/emails)
 */
const sendEmailNotification = async (toEmail, subject, text, html) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'JaldiKharidoo <orders@jaldikharidoo.in>';

  if (!apiKey) {
    console.log('⚠️ RESEND_API_KEY is missing in environment. Skipping email.');
    return false;
  }

  if (!toEmail) {
    console.log('⚠️ Recipient email is missing. Skipping email.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail.toString().trim()],
        subject,
        text,
        html
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✉️ Resend Email delivered to ${toEmail} (ID: ${data.id})`);
      return true;
    } else {
      console.error(`❌ Resend API Error for ${toEmail}:`, data.message || JSON.stringify(data));
      return false;
    }
  } catch (err) {
    console.error(`❌ Resend API Exception for ${toEmail}:`, err.message);
    return false;
  }
};

/**
 * Send order confirmation email to Customer & Admin via Resend
 */
const sendOrderConfirmationEmail = async ({ order, customerEmail, adminEmail }) => {
  const orderId = order._id.toString();
  const shortId = orderId.substring(0, 8);
  const totalAmount = order.totalAmount || 0;
  const paymentMethod = order.paymentMethod || 'COD';
  const customerName = order.user?.name || 'Valued Customer';

  const subject = `Order Confirmed! #${shortId} — JaldiKharidoo 🚀`;
  const text = `Hi ${customerName},\n\nYour order #${orderId} has been placed successfully!\nTotal: ₹${totalAmount} | Payment: ${paymentMethod}\n\nThank you for shopping with JaldiKharidoo!`;

  const itemsListHtml = (order.items || []).map(item => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px;font-weight:600;color:#1e293b;">${item.name || 'Product'}</td>
      <td style="padding:12px;text-align:center;color:#64748b;">x${item.quantity}</td>
      <td style="padding:12px;text-align:right;font-weight:700;color:#f97316;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;color:#1e293b;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#f97316;margin:0;font-size:26px;font-weight:800;">JaldiKharidoo ⚡</h1>
        <p style="color:#64748b;margin-top:4px;font-size:14px;">India's Fastest Delivery</p>
      </div>
      <div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#c2410c;margin:0 0 6px;font-size:18px;">Order Placed Successfully! 🎉</h2>
        <p style="margin:0;font-size:14px;color:#9a3412;">Hi <strong>${customerName}</strong>, your package is being prepared!</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f8fafc;text-align:left;">
            <th style="padding:10px;font-size:12px;text-transform:uppercase;color:#64748b;">Item</th>
            <th style="padding:10px;font-size:12px;text-transform:uppercase;color:#64748b;text-align:center;">Qty</th>
            <th style="padding:10px;font-size:12px;text-transform:uppercase;color:#64748b;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsListHtml}</tbody>
      </table>
      <div style="background:#f8fafc;padding:16px;border-radius:12px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;color:#64748b;">
          <span>Payment Method:</span><strong style="color:#1e293b;">${paymentMethod}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:800;color:#1e293b;">
          <span>Total Paid:</span><span style="color:#f97316;">₹${totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div style="text-align:center;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px;">
        <a href="${process.env.FRONTEND_URL || 'https://jaldikharidoo.in'}/orders" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;">Track Your Order</a>
        <p style="font-size:11px;color:#94a3b8;margin-top:16px;">JaldiKharidoo Store • Thank you for shopping with us!</p>
      </div>
    </div>
  `;

  const tasks = [];
  if (customerEmail) tasks.push(sendEmailNotification(customerEmail, subject, text, html));
  if (adminEmail && adminEmail !== customerEmail) {
    tasks.push(sendEmailNotification(adminEmail, `[ADMIN] New Order #${shortId}`, text, html));
  }

  if (tasks.length === 0) return false;
  const results = await Promise.allSettled(tasks);
  return results.some(r => r.status === 'fulfilled' && r.value === true);
};

/**
 * Send order status update email (Shipped / Delivered / Processing / Cancelled)
 */
const sendOrderStatusUpdateEmail = async ({ order, customerEmail, status }) => {
  const orderId = order._id.toString();
  const shortId = orderId.substring(0, 8);
  const customerName = order.user?.name || 'Valued Customer';
  const siteUrl = process.env.FRONTEND_URL || 'https://jaldikharidoo.in';

  let subject = `Order #${shortId} Status Update — JaldiKharidoo ⚡`;
  let statusHeader = `Order Update`;
  let statusMessage = `Your order status has been updated to <strong>${status}</strong>.`;
  let bannerBg = `#f8fafc`;
  let borderColor = `#3b82f6`;

  if (status === 'shipped') {
    subject = `🚚 Your Order #${shortId} Has Been Shipped! — JaldiKharidoo`;
    statusHeader = `Package Out for Delivery! 🚚`;
    statusMessage = `Great news <strong>${customerName}</strong>! Your order #${shortId} has been shipped and is on its way to your delivery address.`;
    bannerBg = `#eff6ff`;
    borderColor = `#3b82f6`;
  } else if (status === 'delivered') {
    subject = `🎉 Your Order #${shortId} Has Been Delivered! — JaldiKharidoo`;
    statusHeader = `Package Delivered! 🎉`;
    statusMessage = `Hi <strong>${customerName}</strong>, your package for order #${shortId} has been successfully delivered. We hope you love your purchase!`;
    bannerBg = `#f0fdf4`;
    borderColor = `#22c55e`;
  } else if (status === 'cancelled') {
    subject = `🚫 Order #${shortId} Cancelled — JaldiKharidoo`;
    statusHeader = `Order Cancelled 🚫`;
    statusMessage = `Hi <strong>${customerName}</strong>, order #${shortId} has been cancelled as requested.`;
    bannerBg = `#fef2f2`;
    borderColor = `#ef4444`;
  }

  const text = `Hi ${customerName},\n\n${statusHeader}\n${statusMessage}\n\nTrack your order status anytime at ${siteUrl}/orders\n\nThank you for shopping with JaldiKharidoo!`;

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;color:#1e293b;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#f97316;margin:0;font-size:26px;font-weight:800;">JaldiKharidoo ⚡</h1>
        <p style="color:#64748b;margin-top:4px;font-size:14px;">India's Fastest Delivery</p>
      </div>
      <div style="background:${bannerBg};border-left:4px solid ${borderColor};padding:16px;border-radius:8px;margin-bottom:24px;">
        <h2 style="color:#1e293b;margin:0 0 6px;font-size:18px;">${statusHeader}</h2>
        <p style="margin:0;font-size:14px;color:#475569;">${statusMessage}</p>
      </div>
      <div style="text-align:center;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px;">
        <a href="${siteUrl}/orders" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;">View My Orders</a>
        <p style="font-size:11px;color:#94a3b8;margin-top:16px;">JaldiKharidoo Store • Thank you for shopping with us!</p>
      </div>
    </div>
  `;

  return await sendEmailNotification(customerEmail, subject, text, html);
};

module.exports = { sendEmailNotification, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail };
