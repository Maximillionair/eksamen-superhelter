// routes/debug.js - Debug routes for troubleshooting
const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

// Debug route to check superhero data
router.get('/', debugController.debugHeroes);

module.exports = router;
