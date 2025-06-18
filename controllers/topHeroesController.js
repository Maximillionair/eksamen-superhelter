// controllers/topHeroesController.js - Controller for top heroes page
const superheroService = require('../services/superheroService');
const User = require('../models/User');

/**
 * Display top 10 favorited heroes
 */
exports.getTopHeroes = async (req, res) => {
  try {
    // Get top 10 heroes
    const topHeroes = await superheroService.getTopHeroes(10);
    
    // Get user profile with favorite heroes if user is logged in
    let profile = null;
    if (req.session.user && req.session.user.id) {
      profile = await User.findById(req.session.user.id);
    }
    
    res.render('superhero/top-heroes', {
      title: 'Top 10 Superheroes',
      topHeroes,
      profile,
      user: req.session.user
    });
  } catch (error) {
    console.error('Error getting top heroes:', error);
    req.flash('error_msg', 'Failed to load top heroes');
    res.redirect('/');
  }
};
