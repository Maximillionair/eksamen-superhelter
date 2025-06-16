// controllers/superheroController.js - Controller for superhero-related functionality
const superheroService = require('../services/superheroService');

/**
 * Display the landing page with paginated superheroes
 */
exports.getIndex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Get paginated heroes
    const result = await superheroService.getPaginatedHeroes(page, limit);
    
    res.render('index', { 
      title: 'Superhero Database',
      heroes: result.heroes,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalHeroes: result.totalHeroes,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error getting heroes for index:', error);
    req.flash('error_msg', 'Failed to load superheroes');
    res.render('index', { 
      title: 'Superhero Database',
      heroes: [],
      currentPage: 1,
      totalPages: 1,
      totalHeroes: 0,
      user: req.session.user
    });
  }
};

/**
 * Display a single superhero's details
 */
exports.getSuperhero = async (req, res) => {
  try {
    const heroId = req.params.id;
    
    // Fetch hero (will get from database if available and recent, or fetch from API if needed)
    const hero = await superheroService.fetchAndStoreSingleHero(heroId);
    
    if (!hero) {
      req.flash('error_msg', 'Superhero not found');
      return res.redirect('/');
    }
    
    res.render('superhero/details', { 
      title: hero.name,
      hero: hero,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error getting superhero details:', error);
    req.flash('error_msg', 'Failed to load superhero details');
    res.redirect('/');
  }
};

/**
 * Handle search for superheroes
 */
exports.searchSuperheroes = async (req, res) => {
  try {
    const query = req.query.query || '';
    const limit = parseInt(req.query.limit) || 20;
    
    // Search heroes - this will check database first, then API if needed
    const heroes = await superheroService.searchHeroes(query, limit);
    
    // Add a flag to show if heroes were from API
    const source = heroes.length > 0 && !heroes[0].fetchedAt ? 'API' : 'Database';
    
    res.render('superhero/search', { 
      title: 'Search Results',
      heroes: heroes,
      query: query,
      source: source,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error searching superheroes:', error);
    req.flash('error_msg', 'Failed to search superheroes');
    res.redirect('/');
  }
};

/**
 * Search the Superhero API and return results
 */
exports.apiSearch = async (req, res) => {
  try {
    const query = req.query.query || '';
    
    if (!query) {
      return res.json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const results = await superheroService.searchSuperheroAPI(query);
    
    res.json({
      success: true,
      heroes: results
    });
  } catch (error) {
    console.error('Error searching Superhero API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search Superhero API',
      error: error.message
    });
  }
};

/**
 * Add heroes from API to database
 */
exports.addToDatabase = async (req, res) => {
  try {
    const { heroIds } = req.body;
    
    if (!heroIds || !Array.isArray(heroIds) || heroIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hero IDs array is required'
      });
    }
    
    // Limit batch size
    const batchSize = Math.min(heroIds.length, 20);
    const processedIds = heroIds.slice(0, batchSize);
    
    console.log(`Adding ${processedIds.length} heroes to database`);
    
    let added = 0;
    let errors = [];
    
    // Process heroes one by one
    for (const id of processedIds) {
      try {
        await superheroService.fetchAndStoreSingleHero(id);
        added++;
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }
    
    res.json({
      success: true,
      added,
      errors,
      message: `Successfully added ${added} heroes to database`
    });
  } catch (error) {
    console.error('Error adding heroes to database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add heroes to database',
      error: error.message
    });
  }
};

/**
 * Admin function to fetch a batch of heroes from the API to populate the database
 * (Protected by admin middleware in routes)
 */
exports.fetchHeroBatch = async (req, res) => {
  try {
    const startId = parseInt(req.body.startId) || 1;
    const count = parseInt(req.body.count) || 20;
    
    // Limit batch size to prevent API abuse
    const batchSize = Math.min(count, 50);
    
    const result = await superheroService.fetchHeroBatch(startId, batchSize);
    
    req.flash('success_msg', `Successfully fetched ${result.totalFetched} heroes`);
    res.redirect('/');
  } catch (error) {
    console.error('Error fetching hero batch:', error);
    req.flash('error_msg', 'Failed to fetch heroes');
    res.redirect('/');
  }
};
