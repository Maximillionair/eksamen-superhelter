// utils/database.js - Utility functions for database operations
const mongoose = require('mongoose');

/**
 * Execute a database query with a timeout
 * This helps prevent long-running queries from blocking the application
 * 
 * @param {Promise} queryPromise - Mongoose query promise
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise} - Result of the query or error
 */
async function executeQueryWithTimeout(queryPromise, timeout = 5000, operationName = 'Database query') {
  try {
    // Race the query against a timeout promise
    const result = await Promise.race([
      queryPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${operationName} timed out after ${timeout}ms`)), timeout)
      )
    ]);
    return result;
  } catch (error) {
    console.error(`Error in ${operationName}:`, error.message);
    throw error;
  }
}

/**
 * Check if MongoDB is connected
 * @returns {boolean} Connection status
 */
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get current MongoDB connection status
 * @returns {string} Connection status description
 */
function getMongoConnectionStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = {
  executeQueryWithTimeout,
  isMongoConnected,
  getMongoConnectionStatus
};
