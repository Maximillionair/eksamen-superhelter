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
    
    // Search heroes
    const heroes = await superheroService.searchHeroes(query, limit);
    
    res.render('superhero/search', { 
      title: 'Search Results',
      heroes: heroes,
      query: query,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error searching superheroes:', error);
    req.flash('error_msg', 'Failed to search superheroes');
    res.redirect('/');
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
