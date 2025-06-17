// controllers/unifiedDebugController.js - Combined debug controller
const Superhero = require('../models/Superhero');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Debug controller with all diagnostic functions
 */
module.exports = {
  /**
   * Display debug information about superhero data
   */
  debugHeroes: async (req, res) => {
    try {
      // Count total heroes
      const heroCount = await Superhero.countDocuments();
      
      // Get sample heroes if any exist
      const sampleHeroes = await Superhero.find().limit(3);
      
      // Get database connection info
      const dbInfo = {
        host: process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app',
        connectionState: Superhero.db.readyState === 1 ? 'Connected' : 'Disconnected'
      };
      
      // Render debug page with information
      res.render('debug', {
        title: 'Debug Information',
        heroCount,
        sampleHeroes,
        dbInfo
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).send('Error loading debug info: ' + error.message);
    }
  },

  /**
   * Check authentication status
   */
  authStatus: (req, res) => {
    // Sanitize data to avoid exposing sensitive information
    const authStatus = {
      session: {
        exists: !!req.session,
        userId: req.session && req.session.user ? req.session.user.id : 'not set',
        cookie: req.session ? {
          maxAge: req.session.cookie.maxAge,
          httpOnly: req.session.cookie.httpOnly,
          secure: req.session.cookie.secure,
          sameSite: req.session.cookie.sameSite || 'not set'
        } : 'no session',
      },
      cookies: {
        hasToken: !!req.cookies.token,
        tokenExpires: req.cookies.token ? 'exists' : 'not set',
      },
      userInfo: req.session && req.session.user ? {
        id: req.session.user.id,
        username: req.session.user.username,
        // Do not include email or other personal data in debug output
      } : 'not authenticated'
    };
    
    res.json(authStatus);
  },

  /**
   * Profile access diagnostic check
   */
  profileCheck: async (req, res) => {
    // Check session info
    const hasSession = !!req.session;
    const hasUser = req.session && !!req.session.user;
    const userId = hasUser ? req.session.user.id : null;
    
    // Try to get user info if logged in
    let user = null;
    let error = null;
    
    if (userId) {
      try {
        user = await User.findById(userId).select('-password');
      } catch (err) {
        error = err.message;
      }
    }
    
    // Return diagnostic info
    res.json({
      session: {
        exists: hasSession,
        hasUser,
        userId
      },
      cookies: req.cookies,
      user: user ? {
        id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favoriteHeroes?.length || 0
      } : null,
      error,
      links: {
        profile: '/profile',
        home: '/',
        login: '/auth/login'
      }
    });
  },

  /**
   * System information
   */  systemInfo: (req, res) => {
    res.json({
      node: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      env: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development',
        mongoUri: process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app'
      }
    });
  },

  /**
   * Debug database connection status
   */
  dbStatus: (req, res) => {
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      connectionState: states[connectionState] || 'unknown',
      mongoUri: process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app',
      sessionUser: req.session.user ? 'exists' : 'missing',
      cookieToken: req.cookies.token ? 'exists' : 'missing'
    });
  },

  /**
   * Debug profile rendering without auth checks
   */
  directProfileRender: async (req, res) => {
    try {
      // Try to get user ID from session or JWT
      let userId = null;
      
      if (req.session && req.session.user) {
        userId = req.session.user.id;
      } else if (req.cookies.token) {
        try {
          const jwt = require('../utils/jwt');
          const decoded = jwt.verifyToken(req.cookies.token);
          if (decoded) {
            userId = decoded.sub;
          }
        } catch (error) {
          console.error('Error decoding JWT:', error);
        }
      }
      
      if (!userId) {
        return res.send({
          error: 'No authentication found - cannot render profile'
        });
      }
      
      // Get user with favorites populated
      const user = await User.findById(userId);
      
      if (!user) {
        return res.send({
          error: 'User not found in database'
        });
      }
      
      // Get favorite heroes
      const favoriteHeroes = await Superhero.find({
        id: { $in: user.favoriteHeroes }
      });
      
      // Render the profile page
      res.render('profile/index', {
        title: 'My Profile (Debug)',
        user: req.session.user,
        profile: user,
        favoriteHeroes: favoriteHeroes
      });
    } catch (error) {
      console.error('Error in direct profile render:', error);
      res.send({
        error: 'Failed to render profile',
        message: error.message
      });
    }
  }
};
