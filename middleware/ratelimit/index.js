// middleware/ratelimit/index.js - Rate limiting middleware
const rateLimit = require('express-rate-limit');

// Basic rate limiter settings for general routes
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// More strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again after an hour',
});

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 API requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again after 15 minutes'
  },
  handler: (req, res, next, options) => {
    // For API routes, return JSON response
    res.status(options.statusCode).json(options.message);
  },
});

// Rate limiter for search endpoints
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 searches per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Search rate limit exceeded, please try again after 5 minutes',
});

module.exports = {
  standardLimiter,
  authLimiter,
  apiLimiter,
  searchLimiter
};
