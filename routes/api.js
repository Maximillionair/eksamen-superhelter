// routes/api.js - API routes for the application
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Search heroes
router.get('/heroes/search', apiController.searchHeroes);

// Get hero by ID
router.get('/heroes/:id', apiController.getHero);

module.exports = router;
