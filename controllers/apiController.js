// controllers/apiController.js - API endpoints for the application
const superheroService = require('../services/superheroService');

/**
 * API endpoint to search for heroes
 */
exports.searchHeroes = async (req, res) => {
  try {
    const query = req.query.query || '';
    const limit = parseInt(req.query.limit) || 20;
    
    // This will search local DB first, then fall back to API if needed
    const heroes = await superheroService.searchHeroes(query, limit);
    
    // Return simplified hero data
    const simplifiedHeroes = heroes.map(hero => ({
      id: hero.id,
      name: hero.name,
      publisher: hero.biography?.publisher || 'Unknown',
      image: hero.image?.url || null
    }));
    
    res.json({
      success: true,
      count: simplifiedHeroes.length,
      heroes: simplifiedHeroes
    });
  } catch (error) {
    console.error('API Error searching heroes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search heroes'
    });
  }
};

/**
 * API endpoint to get a single hero by ID
 */
exports.getHero = async (req, res) => {
  try {
    const heroId = req.params.id;
    const hero = await superheroService.fetchAndStoreSingleHero(heroId);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        error: 'Hero not found'
      });
    }
    
    res.json({
      success: true,
      hero: hero
    });
  } catch (error) {
    console.error('API Error getting hero:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hero'
    });
  }
};
