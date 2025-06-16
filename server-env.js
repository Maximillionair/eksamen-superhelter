// server-env.js - Environment variables for server deployment
// This file should be copied to the VM and loaded before starting the app
// Usage: node -r ./server-env.js app.js

// Set the MongoDB URI for the server environment
process.env.MONGODB_URI = 'mongodb://10.12.87.70:27017/superhero-app';

// Print confirmation
console.log('Server environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// You can add other environment-specific variables here as needed
