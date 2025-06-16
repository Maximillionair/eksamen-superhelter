// routes/superhero.js - Superhero routes
const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');

// Search route
router.get('/search', superheroController.searchSuperheroes);

// Individual superhero route
router.get('/:id', superheroController.getSuperhero);

// Batch fetch route - could be protected by admin middleware in a real application
router.post('/batch', superheroController.fetchHeroBatch);

module.exports = router;
