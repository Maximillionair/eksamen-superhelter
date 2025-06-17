// routes/profile.js - Profile routes
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Middleware to ensure we're on HTTP protocol
const ensureHttp = (req, res, next) => {
  console.log('[PROFILE ROUTE] Protocol check:', req.protocol);
  
  // If we're on HTTPS but not supposed to be, redirect to HTTP
  if (req.protocol === 'https') {
    console.log('[PROFILE ROUTE] Redirecting from HTTPS to HTTP');
    const httpUrl = 'http://' + req.headers.host + req.originalUrl;
    return res.redirect(httpUrl);
  }
  
  next();
};

// Protected profile routes - adding ensureHttp middleware
router.get('/', ensureHttp, isAuthenticated, profileController.getProfile);
router.post('/', ensureHttp, isAuthenticated, profileController.updateProfile);
router.post('/password', ensureHttp, isAuthenticated, profileController.changePassword);

// Favorites management
router.post('/favorites/:id/add', ensureHttp, isAuthenticated, profileController.addToFavorites);
router.post('/favorites/:id/remove', ensureHttp, isAuthenticated, profileController.removeFromFavorites);

module.exports = router;
