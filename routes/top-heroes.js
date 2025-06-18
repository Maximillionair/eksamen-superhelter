// routes/top-heroes.js - Routes for top heroes
const express = require('express');
const router = express.Router();
const topHeroesController = require('../controllers/topHeroesController');

// Top heroes page
router.get('/', topHeroesController.getTopHeroes);

module.exports = router;
