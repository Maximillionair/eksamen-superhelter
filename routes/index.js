// routes/index.js - Main routes
const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');
const { isAuthenticated } = require('../middleware/auth');


// Home page route
router.get('/' ,isAuthenticated, superheroController.getIndex);

module.exports = router;
