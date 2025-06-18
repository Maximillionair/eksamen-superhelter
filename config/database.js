// config/database.js - Centralized MongoDB connection handling
const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB
 * First tries VM connection, then falls back to local connection if VM fails
 */
async function connectToDatabase() {
  // Connection options for better error handling and compatibility
  const options = {
    serverSelectionTimeoutMS: 5000, // Reduced timeout for faster fallback
    socketTimeoutMS: 45000,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  const vmMongoUri = process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app';
  const localMongoUri = 'mongodb://localhost:27017/superhero-app';

  console.log(`Starting database connection process...`);
  console.log(`Attempting to connect to MongoDB at: ${vmMongoUri}`);

  try {
    // Try VM connection first
    await mongoose.connect(vmMongoUri, options);
    console.log('MongoDB connected successfully to VM');
    global.isVmEnvironment = true;
    return true;
  } catch (vmErr) {
    console.error('MongoDB VM connection error:', vmErr.message);
    console.log('Trying local MongoDB connection instead...');
    
    try {
      // Fall back to local connection
      await mongoose.connect(localMongoUri, options);
      console.log('MongoDB connected successfully to localhost');
      global.isVmEnvironment = false;
      return true;
    } catch (localErr) {
      console.error('MongoDB local connection error:', localErr.message);
      console.error('Could not connect to any MongoDB instance. Functionality requiring database will not work.');
      global.isVmEnvironment = false;
      return false;
    }
  }
}

// Event listeners for MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Close MongoDB connection when Node process ends
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = { connectToDatabase };
