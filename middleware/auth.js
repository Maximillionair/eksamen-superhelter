// middleware/auth.js - Authentication middleware
const User = require('../models/User');

/**
 * Middleware to check if user is authenticated
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  req.flash('error_msg', 'You need to be logged in to view this page');
  res.redirect('/auth/login');
};

/**
 * Middleware to check if user is already authenticated (for login/register pages)
 */
exports.isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  next();
};

/**
 * Middleware to set user data for all routes
 */
exports.setUserData = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (err) {
      console.error('Error setting user data:', err);
    }
  }
  next();
};
