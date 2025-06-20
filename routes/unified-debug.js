// routes/unified-debug.js - Consolidated debug routes
const express = require('express');
const router = express.Router();
const debugCtrl = require('../controllers/unifiedDebugController');

// General debug section
router.get('/', debugCtrl.debugHeroes);

// Authentication info
router.get('/auth', debugCtrl.authStatus);

// Profile diagnostics
router.get('/profile', debugCtrl.profileCheck);

// System info
router.get('/system', debugCtrl.systemInfo);

// Database status
router.get('/db-status', debugCtrl.dbStatus);

// Direct profile render (bypasses auth)
router.get('/direct-profile', debugCtrl.directProfileRender);

module.exports = router;
