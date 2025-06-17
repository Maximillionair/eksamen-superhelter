// middleware/auth.js - Authentication middleware
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to check if user is authenticated via session or JWT
 */
exports.isAuthenticated = async (req, res, next) => {
  // Log environment and request details for debugging
  console.log(`[AUTH] Environment: ${global.isVmEnvironment ? 'VM' : 'Local'}`);
  console.log(`[AUTH] Request URL: ${req.originalUrl}`);
  console.log(`[AUTH] Request protocol: ${req.protocol}`);
  console.log(`[AUTH] Session exists: ${!!req.session}`);
  console.log(`[AUTH] Session user exists: ${!!(req.session && req.session.user)}`);
  
  // Check for session authentication first
  if (req.session && req.session.user) {
    console.log('[AUTH] User authenticated via session');
    return next();
  }
  
  // If no session, check for JWT token in cookies
  const token = req.cookies.token;
  console.log('[AUTH] JWT token exists:', !!token);
  
  if (token) {
    const decoded = verifyToken(token);
    console.log('[AUTH] JWT decoded:', !!decoded);
    
    if (decoded) {
      try {
        // Find user by ID from token
        const user = await User.findById(decoded.sub).select('-password');
        console.log('[AUTH] User found from token:', !!user);
        
        if (user) {
          // Set user in session and locals
          req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
          };
          res.locals.user = req.session.user;
          console.log('[AUTH] User set in session from token');
          return next();
        }
      } catch (error) {
        console.error('[AUTH] JWT auth error:', error);
      }
    }
    
    // If token is invalid, clear the cookie
    console.log('[AUTH] Clearing invalid token cookie');
    const cookieOptions = { 
      httpOnly: true, 
      secure: false,
      sameSite: 'lax'
    };
    res.clearCookie('token', cookieOptions);
  }
  
  // No valid authentication, redirect to login
  req.flash('error_msg', 'Please log in to view this page');
  
  // Handle profile URLs specially to ensure proper protocol - critical fix for VM environment
  if (req.originalUrl.startsWith('/profile')) {
    console.log('[AUTH] Special handling for profile redirect');
    const loginUrl = 'http://' + req.headers.host + '/auth/login';
    return res.redirect(loginUrl);
  }
  
  // Normal redirect for other URLs
  return res.redirect('/auth/login');
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
