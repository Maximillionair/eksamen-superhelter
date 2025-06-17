// scripts/check-mongodb.js - Script to check and fix MongoDB connections

const mongoose = require('mongoose');

// Connect to MongoDB with retries
async function testMongoConnection() {
  console.log('Testing MongoDB connections...');
  const vmUris = [
    'mongodb://10.12.87.70:27017/superhero-app',
    'mongodb://localhost:27017/superhero-app'
  ];
  
  for (const uri of vmUris) {
    try {
      console.log(`Attempting to connect to ${uri}`);
      await mongoose.connect(uri);
      console.log('✅ Successfully connected to MongoDB at:', uri);
      
      // Check if collections exist
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`Found ${collections.length} collections`);
      
      for (const collection of collections) {
        console.log(` - ${collection.name}`);
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`   Documents: ${count}`);
      }
      
      // Check for superhero data
      const Superhero = mongoose.model('Superhero', new mongoose.Schema({ id: Number, name: String }));
      const heroCount = await Superhero.countDocuments();
      console.log(`Superhero collection has ${heroCount} documents`);
      
      // Check for user data
      const User = mongoose.model('User', new mongoose.Schema({ username: String, email: String }));
      const userCount = await User.countDocuments();
      console.log(`User collection has ${userCount} documents`);
      
      // Success
      mongoose.disconnect();
      return {
        success: true,
        uri,
        collections: collections.length,
        heroes: heroCount,
        users: userCount
      };
    } catch (error) {
      console.error(`❌ Failed to connect to ${uri}:`, error.message);
      try {
        await mongoose.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
  }
  
  return { 
    success: false,
    message: 'Could not connect to any MongoDB instance'
  };
}

// Run the test
testMongoConnection()
  .then(result => {
    if (result.success) {
      console.log('\n✅ MongoDB connection test successful!');
      console.log(`Connected to: ${result.uri}`);
      console.log(`Collections: ${result.collections}`);
      console.log(`Heroes: ${result.heroes}`);
      console.log(`Users: ${result.users}`);
      
      console.log('\nRecommendations:');
      console.log('1. Update your app.js to use this connection string:', result.uri);
      console.log('2. Make sure all database calls have proper timeouts and error handling');
    } else {
      console.log('\n❌ MongoDB connection test failed!');
      console.log(result.message);
      
      console.log('\nRecommendations:');
      console.log('1. Check if MongoDB is installed and running');
      console.log('2. Try installing MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('3. Or use MongoDB Atlas for a cloud-hosted database');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Test script error:', err);
    process.exit(1);
  });
