const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://Jaldikharido:nEkWpoYTVxtKnBOI@m0.upozri5.mongodb.net/ecommerce?appName=M0';

async function run() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas.');

    const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String, role: String }));
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

    console.log('\n--- USERS IN MONGODB ATLAS ---');
    const users = await User.find();
    users.forEach(u => console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`));

    console.log('\n--- LATEST ORDERS IN MONGODB ATLAS ---');
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    if (orders.length === 0) {
      console.log('No orders found in Atlas.');
    } else {
      orders.forEach((o, i) => {
        console.log(`\nOrder #${i + 1}:`);
        console.log(`ID: ${o._id}`);
        console.log(`Created: ${o.createdAt}`);
        console.log(`User ID: ${o.user}`);
        console.log(`Total: ₹${o.totalAmount}`);
        console.log(`Phone: ${o.shippingAddress?.phone}`);
        console.log(`Status: ${o.status}`);
      });
    }

  } catch (err) {
    console.error('Error connecting to Atlas:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
