// routes/profile.js - Profile routes
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middleware/auth');

// Protected profile routes
router.get('/', isAuthenticated, profileController.getProfile);
router.post('/', isAuthenticated, profileController.updateProfile);
router.post('/password', isAuthenticated, profileController.changePassword); // Add change password route

// Favorites management
router.post('/favorites/:id/add', isAuthenticated, profileController.addToFavorites);
router.post('/favorites/:id/remove', isAuthenticated, profileController.removeFromFavorites);

module.exports = router;
