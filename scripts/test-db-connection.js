// scripts/test-db-connection.js - Test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

// The MongoDB URI from your .env file - explicit fallback to VM IP
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app';

// Print environment variable state for debugging
console.log('MONGODB_URI environment variable:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);

// Connection options with shorter timeout
const options = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
  connectTimeoutMS: 10000 // Give up initial connection after 10 seconds
};

mongoose.connect(MONGODB_URI, options)
  .then(() => {
    console.log('✓ Successfully connected to MongoDB');
    console.log('Database connection is working properly');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('✗ Failed to connect to MongoDB');
    console.error(`Error: ${err.message}`);
    
    // Provide specific advice based on error
    if (err.name === 'MongooseServerSelectionError') {
      console.log('\nPossible causes:');
      console.log('1. MongoDB is not running on the VM at 10.12.87.70');
      console.log('2. MongoDB is not configured to accept remote connections');
      console.log('3. Firewall is blocking port 27017');
      console.log('4. Network route between application VM and database VM is blocked');
      
      console.log('\nTroubleshooting steps:');
      console.log('1. Check if MongoDB is running: ssh into database VM and run "sudo systemctl status mongodb" or "sudo systemctl status mongod"');
      console.log('2. Check MongoDB config: ensure bindIp includes 0.0.0.0 or the app VM\'s IP in /etc/mongod.conf');
      console.log('3. Check if port 27017 is open: "sudo ufw status" and ensure port 27017 is allowed');
      console.log('4. Test basic connectivity: from app VM run "ping 10.12.87.70" and "telnet 10.12.87.70 27017"');
    }
  });
