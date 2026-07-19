require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected.');

    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    if (orders.length === 0) {
      console.log('No orders found in the database.');
    } else {
      console.log('\n--- LATEST 5 ORDERS ---');
      orders.forEach((o, i) => {
        console.log(`\nOrder #${i + 1}:`);
        console.log(`ID: ${o._id}`);
        console.log(`Created: ${o.createdAt}`);
        console.log(`User: ${o.user ? `${o.user.name} (${o.user.email})` : 'GUEST/NULL'}`);
        console.log(`Total: ₹${o.totalAmount}`);
        console.log(`Phone: ${o.shippingAddress?.phone}`);
        console.log(`Status: ${o.status}`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
