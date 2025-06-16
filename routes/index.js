// routes/index.js - Main routes
const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');

// Home page route
router.get('/', superheroController.getIndex);

module.exports = router;
