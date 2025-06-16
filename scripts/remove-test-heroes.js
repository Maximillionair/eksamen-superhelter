// scripts/remove-test-heroes.js - Remove test heroes from the database
require('dotenv').config();
const mongoose = require('mongoose');
const Superhero = require('../models/Superhero');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app')
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
    
    // Remove test heroes (IDs 1001, 1002, 1003)
    console.log('Removing test heroes...');
    const result = await Superhero.deleteMany({ 
      $or: [
        { id: 1001 },
        { id: 1002 },
        { id: 1003 }
      ] 
    });
    
    // Get new count of heroes
    const afterCount = await Superhero.countDocuments();
    
    console.log(`Successfully removed ${result.deletedCount} test heroes`);
    console.log(`After deletion: ${afterCount} heroes remaining in database`);
  } catch (error) {
    console.error('Error removing test heroes:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the function to remove heroes
removeTestHeroes();
