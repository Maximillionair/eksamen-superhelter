// routes/profile.js - Profile routes
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Debug middleware for the profile routes
router.use((req, res, next) => {
  console.log('[PROFILE ROUTE] Accessed profile route');
  console.log('[PROFILE ROUTE] Protocol:', req.protocol);
  console.log('[PROFILE ROUTE] X-Forwarded-Proto:', req.headers['x-forwarded-proto'] || 'none');
  console.log('[PROFILE ROUTE] Full URL:', `${req.protocol}://${req.headers.host}${req.url}`);
  console.log('[PROFILE ROUTE] Session exists:', !!req.session);
  console.log('[PROFILE ROUTE] User in session:', req.session && !!req.session.user);
  next();
});

// Protected profile routes
router.get('/', isAuthenticated, profileController.getProfile);
router.post('/', isAuthenticated, profileController.updateProfile);

// Favorites management
router.post('/favorites/:id/add', isAuthenticated, profileController.addToFavorites);
router.post('/favorites/:id/remove', isAuthenticated, profileController.removeFromFavorites);

module.exports = router;
