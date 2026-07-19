const mongoose = require('mongoose');
const ATLAS_URI = 'mongodb+srv://Jaldikharido:nEkWpoYTVxtKnBOI@m0.upozri5.mongodb.net/ecommerce?appName=M0';

async function getProduct() {
  await mongoose.connect(ATLAS_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({ name: String }));
  const p = await Product.findOne();
  console.log('Valid Product ID:', p._id.toString(), p.name);
  await mongoose.disconnect();
}
getProduct();
