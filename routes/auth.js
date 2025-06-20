// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/auth');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validators');
const { authLimiter } = require('../middleware/ratelimit');

// Login routes
router.get('/login', isNotAuthenticated, authController.getLogin);
router.post('/login', isNotAuthenticated, authLimiter, loginValidationRules, validate, authController.postLogin);

// Registration routes
router.get('/register', isNotAuthenticated, authController.getRegister);
router.post('/register', isNotAuthenticated, authLimiter, registerValidationRules, validate, authController.postRegister);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;
