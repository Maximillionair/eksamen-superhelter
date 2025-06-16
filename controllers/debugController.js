// controllers/debugController.js - Debug controller for troubleshooting
const Superhero = require('../models/Superhero');

/**
 * Display debug information about superhero data
 */
exports.debugHeroes = async (req, res) => {
  try {
    // Count total heroes
    const heroCount = await Superhero.countDocuments();
    
    // Get sample heroes if any exist
    const sampleHeroes = await Superhero.find().limit(3);
    
    // Get database connection info
    const dbInfo = {
      host: process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app',
      connectionState: Superhero.db.readyState === 1 ? 'Connected' : 'Disconnected'
    };

    // Render debug page
    res.render('debug', { 
      title: 'Debug Page',
      heroCount,
      sampleHeroes,
      dbInfo
    });
  } catch (error) {
    console.error('Error in debug controller:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while retrieving debug information',
      error
    });
  }
};
