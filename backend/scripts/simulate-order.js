require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendEmailNotification, sendSmsNotification } = require('../utils/notifier');

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB.');

    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.error('❌ No user found in database. Create a user first.');
      process.exit(1);
    }
    console.log(`Using User: ${user.name} (${user.email})`);

    // Find a product
    const product = await Product.findOne();
    if (!product) {
      console.error('❌ No product found in database. Create a product first.');
      process.exit(1);
    }
    console.log(`Using Product: ${product.name} (Price: ₹${product.price})`);

    // Mock order details
    const shippingAddress = {
      fullName: user.name,
      address: '123 Test Street',
      city: 'Delhi',
      state: 'Delhi',
      pinCode: '110001',
      phone: '9876543210'
    };
    const paymentMethod = 'COD';
    const totalAmount = product.price;

    console.log('\n⏳ Simulating placeOrder controller execution...');
    
    // Trigger dispatches
    const emailSubject = `Order Placed Successfully - #TEST`;
    const emailText = `Hi ${user.name},\n\nYour order has been placed successfully! Total Amount: ₹${totalAmount}. Payment Method: ${paymentMethod}.\n\nThank you for shopping with JaldiKharidoo! 🚀`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #f97316; margin-top: 0;">Order Placed Successfully! 🎉</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order has been created. Here are your order details:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left; font-weight: bold; color: #475569;">Payment Method</th>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${paymentMethod}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left; font-weight: bold; color: #475569;">Total Price</th>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #f97316;">₹${totalAmount}</td>
          </tr>
        </table>
      </div>
    `;

    console.log('Sending email to customer...');
    const customerSent = await sendEmailNotification(user.email, emailSubject, emailText, emailHtml);
    console.log(`Customer email sent: ${customerSent}`);

    console.log('Sending email to admin (SMTP_USER)...');
    const adminSent = await sendEmailNotification(process.env.SMTP_USER, `🚨 Admin: New Order`, `New Order of ₹${totalAmount}`);
    console.log(`Admin email sent: ${adminSent}`);

  } catch (err) {
    console.error('❌ Error during simulation:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database.');
  }
}

run();
