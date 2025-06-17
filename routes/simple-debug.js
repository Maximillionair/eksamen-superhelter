// routes/simple-debug.js - Simple debug routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Test route without auth middleware to check profile access
router.get('/profile-check', async (req, res) => {
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
  res.send({
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
});

module.exports = router;
