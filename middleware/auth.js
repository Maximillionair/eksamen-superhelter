// middleware/auth.js - Authentication middleware
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to check if user is authenticated via session or JWT
 */
exports.isAuthenticated = async (req, res, next) => {
  console.log('[AUTH] isAuthenticated middleware called');
  console.log('[AUTH] Protocol:', req.protocol);
  console.log('[AUTH] X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
  console.log('[AUTH] Request URL:', req.originalUrl);
  console.log('[AUTH] Session exists:', !!req.session);
  console.log('[AUTH] User in session:', req.session && !!req.session.user);
  
  // Check for session authentication first
  if (req.session && req.session.user) {
    console.log('User authenticated via session');
    return next();
  }
  
  // If no session, check for JWT token in cookies
  const token = req.cookies.token;
  console.log('JWT token exists:', !!token);
  
  if (token) {
    const decoded = verifyToken(token);
    console.log('JWT decoded:', !!decoded);
    
    if (decoded) {
      try {
        // Find user by ID from token
        const user = await User.findById(decoded.sub).select('-password');
        console.log('User found from token:', !!user);
        
        if (user) {
          // Set user in session and locals
          req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
          };
          res.locals.user = req.session.user;
          console.log('User set in session from token');
          return next();
        }
      } catch (error) {
        console.error('JWT auth error:', error);
      }
    }
    
    // If token is invalid, clear the cookie
    console.log('Clearing invalid token cookie');
    res.clearCookie('token', { 
      httpOnly: true, 
      secure: false,
      sameSite: 'lax'
    });
  }
  
  // No valid session or token
  req.flash('error_msg', 'You need to be logged in to view this page');
  res.redirect('/auth/login');
};

/**
 * Middleware to check if user is already authenticated (for login/register pages)
 */
exports.isNotAuthenticated = async (req, res, next) => {
  // Check session first
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  
  // Check JWT token
  const token = req.cookies.token;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const user = await User.findById(decoded.sub).select('-password');
        if (user) {
          // Set user in session and redirect
          req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
          };
          return res.redirect('/');
        }
      } catch (error) {
        console.error('JWT auth check error:', error);
      }
    }
    // Clear invalid token
    res.clearCookie('token');
  }
  
  next();
};

/**
 * Middleware to set user data for all routes
 */
exports.setUserData = async (req, res, next) => {
  // Already authenticated via session
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  } 
  // Check for JWT token
  else {
    const token = req.cookies.token;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        try {
          const user = await User.findById(decoded.sub).select('-password');
          if (user) {
            req.user = user;
            req.session.user = {
              id: user._id,
              username: user.username,
              email: user.email
            };
            res.locals.user = req.session.user;
          }
        } catch (err) {
          console.error('Error setting user data:', err);
        }
      }
    }
  }
  next();
};
