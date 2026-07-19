const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://Jaldikharido:nEkWpoYTVxtKnBOI@m0.upozri5.mongodb.net/ecommerce?appName=M0';

async function inspectLatestOrder() {
  try {
    await mongoose.connect(ATLAS_URI);
    const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String }));
    const Order = mongoose.model('Order', new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, totalAmount: Number, createdAt: Date }));

    const order = await Order.findOne().sort({ createdAt: -1 }).populate('user');
    console.log('\n--- LATEST ORDER IN ATLAS ---');
    console.log('Order ID:', order._id);
    console.log('Created At:', order.createdAt);
    console.log('Total Amount:', order.totalAmount);
    console.log('User Name:', order.user ? order.user.name : 'NULL');
    console.log('User Email:', order.user ? order.user.email : 'NULL');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectLatestOrder();
