const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://Jaldikharido:nEkWpoYTVxtKnBOI@m0.upozri5.mongodb.net/ecommerce?appName=M0';

async function resetStock() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to Atlas.');

    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, stock: Number }));

    const products = await Product.find();
    console.log(`Found ${products.length} products in Atlas.`);

    let outOfStock = 0;
    for (const p of products) {
      if (p.stock <= 5) {
        console.log(`⚠️ Low/Zero Stock: "${p.name}" (Current stock: ${p.stock}) -> Resetting to 100.`);
        p.stock = 100;
        await p.save();
        outOfStock++;
      }
    }

    console.log(`\n✅ Stock reset complete! Fixed ${outOfStock} low/zero stock items.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

resetStock();
