// routes/debug-profile.js - Debug routes for profile issues
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Superhero = require('../models/Superhero');

// Debug route that shows profile info without auth middleware
router.get('/info', async (req, res) => {
  console.log('Debug profile info route accessed');
  console.log('Protocol:', req.protocol);
  console.log('X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
  console.log('Host:', req.headers.host);
  console.log('Full URL:', `${req.protocol}://${req.headers.host}${req.url}`);
  console.log('Session exists:', !!req.session);
  console.log('User in session:', req.session && !!req.session.user);
  console.log('User ID:', req.session?.user?.id);
  console.log('Cookies:', req.cookies);
  
  let userId = null;
  let userData = null;
  
  // Try to get user ID from session or JWT
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
  
  // Try to fetch user data if we have an ID
  if (userId) {
    try {
      userData = await User.findById(userId);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }
  
  res.send({
    message: 'Debug profile info',
    protocol: req.protocol,
    headers: {
      host: req.headers.host,
      forwarded: req.headers['x-forwarded-proto'] || 'none'
    },
    cookies: req.cookies,
    session: req.session ? {
      exists: true,
      hasUser: !!req.session.user,
      userId: req.session?.user?.id || null
    } : null,
    userData: userData ? {
      id: userData._id,
      username: userData.username,
      email: userData.email,
      favoriteCount: userData.favoriteHeroes?.length || 0
    } : null
  });
});

// Direct profile render route that bypasses normal auth flow
router.get('/direct-render', async (req, res) => {
  console.log('Direct profile render route accessed');
  
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
    
    // Set session user if not already set
    if (!req.session.user) {
      req.session.user = {
        id: user._id,
        username: user.username,
        email: user.email
      };
    }
    
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
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

module.exports = router;
