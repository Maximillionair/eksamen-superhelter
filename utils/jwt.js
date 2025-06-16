// utils/jwt.js - JWT utility functions
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object with id and optional other properties
 * @returns {string} JWT token
 */
exports.generateToken = (user) => {
  const payload = {
    sub: user.id, // Subject: Who is this token for
    username: user.username,
    iat: Date.now() // Issued at timestamp
  };
  return jwt.sign(payload, jwtConfig.secret, jwtConfig.options);
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};
