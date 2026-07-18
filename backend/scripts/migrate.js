const mongoose = require('mongoose');

// Define connection strings
const LOCAL_URI = 'mongodb://localhost:27017/ecommerce';
// The user will provide their Atlas connection string as an argument
const ATLAS_URI = process.argv[2];

if (!ATLAS_URI) {
  console.error('\n❌ Error: Please provide your MongoDB Atlas connection string as an argument.');
  console.log('\nUsage:');
  console.log('node scripts/migrate.js "mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/ecommerce"\n');
  process.exit(1);
}

const runMigration = async () => {
  try {
    console.log('⏳ Connecting to local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local MongoDB.');

    console.log('⏳ Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas.');

    // Collections to migrate
    const collections = ['users', 'products', 'orders'];

    for (const collName of collections) {
      console.log(`\n📦 Migrating collection: "${collName}"...`);
      
      const localColl = localConn.collection(collName);
      const atlasColl = atlasConn.collection(collName);

      // Fetch local documents
      const docs = await localColl.find({}).toArray();
      console.log(`🔍 Found ${docs.length} documents in local "${collName}".`);

      if (docs.length > 0) {
        // Clear destination collection on Atlas to prevent duplicates
        await atlasColl.deleteMany({});
        console.log(`🧹 Cleared existing documents in Atlas "${collName}".`);

        // Insert documents
        await atlasColl.insertMany(docs);
        console.log(`✨ Successfully inserted ${docs.length} documents into Atlas "${collName}".`);
      } else {
        console.log(`⚠️ Collection "${collName}" is empty. Skipping.`);
      }
    }

    console.log('\n🎉 Database migration completed successfully!');
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
