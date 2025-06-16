// scripts/remove-test-heroes.js - Remove test heroes from the database
require('dotenv').config();
const mongoose = require('mongoose');
const Superhero = require('../models/Superhero');

// Connect to MongoDB - use the fixed VM IP
const MONGODB_URI = 'mongodb://10.12.87.70:27017/superhero-app';
console.log('Attempting to connect to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000 // Give it more time to connect to remote VM
})
  .then(() => console.log('MongoDB connected to VM'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to remove test heroes
async function removeTestHeroes() {
  try {
    // Get current count of heroes
    const beforeCount = await Superhero.countDocuments();
    console.log(`Before deletion: ${beforeCount} heroes in database`);
      // Remove test heroes by ID and name
    console.log('Removing test heroes...');
    
    // Use both ID and name for maximum coverage
    const result = await Superhero.deleteMany({ 
      $or: [
        { id: { $in: [1001, 1002, 1003, 9001, 9002, 9003] } }, // Test IDs
        { name: { $in: ['Test Hero 1', 'Test Hero 2', 'Test Hero 3'] } } // Test names
      ] 
    });
    
    // Get new count of heroes
    const afterCount = await Superhero.countDocuments();
    
    console.log(`Successfully removed ${result.deletedCount} test heroes`);
    console.log(`After deletion: ${afterCount} heroes remaining in database`);  } catch (error) {
    console.error('Error removing test heroes:', error);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
    process.exit(0);
  }
}

// Run the function to remove heroes
removeTestHeroes().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
