// controllers/profileController.js - Controller for user profile management
const User = require('../models/User');
const Superhero = require('../models/Superhero');

/**
 * Display user profile
 */
exports.getProfile = async (req, res) => {
  console.log('[PROFILE] getProfile controller called');
  console.log('[PROFILE] Protocol:', req.protocol);
  console.log('[PROFILE] X-Forwarded-Proto:', req.headers['x-forwarded-proto'] || 'none');
  
  try {
    // Get user ID from session or JWT
    let userId = null;
    
    if (req.session && req.session.user) {
      userId = req.session.user.id;
      console.log('[PROFILE] User ID from session:', userId);
    } else if (req.cookies.token) {
      try {
        const jwt = require('../utils/jwt');
        const decoded = jwt.verifyToken(req.cookies.token);
        if (decoded) {
          userId = decoded.sub;
          console.log('[PROFILE] User ID from JWT:', userId);
        }
      } catch (error) {
        console.error('[PROFILE] Error decoding JWT:', error);
      }
    }
    
    if (!userId) {
      console.log('[PROFILE] No user ID found, redirecting to login');
      req.flash('error_msg', 'Please log in to access your profile');
      return res.redirect('http://' + req.headers.host + '/auth/login');
    }
    
    // Get user with favorites populated
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('[PROFILE] User not found in database');
      req.flash('error_msg', 'User not found');
      return res.redirect('http://' + req.headers.host + '/');
    }
    
    // Get favorite heroes
    const favoriteHeroes = await Superhero.find({
      id: { $in: user.favoriteHeroes }
    });
    
    // Ensure session has user info
    if (!req.session.user) {
      req.session.user = {
        id: user._id,
        username: user.username,
        email: user.email
      };
      console.log('[PROFILE] User set in session from JWT');
    }
    
    console.log('[PROFILE] Rendering profile page');
    res.render('profile/index', {
      title: 'My Profile',
      user: req.session.user,
      profile: user,
      favoriteHeroes: favoriteHeroes
    });
  } catch (error) {
    console.error('[PROFILE] Error getting profile:', error);
    req.flash('error_msg', 'Failed to load profile');
    return res.redirect('http://' + req.headers.host + '/');
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Find user
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/profile');
    }
    
    // Check if username or email is already taken by another user
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        req.flash('error_msg', 'Username is already taken');
        return res.redirect('/profile');
      }
    }
    
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        req.flash('error_msg', 'Email is already registered');
        return res.redirect('/profile');
      }
    }
    
    // Update user
    user.username = username;
    user.email = email;
    
    await user.save();
    
    // Update session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error_msg', 'Failed to update profile');
    res.redirect('/profile');
  }
};

/**
 * Add a superhero to favorites
 */
exports.addToFavorites = async (req, res) => {
  try {
    const heroId = parseInt(req.params.id);
    
    // Find user
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect(`/superhero/${heroId}`);
    }
    
    // Check if hero exists
    const hero = await Superhero.findOne({ id: heroId });
    
    if (!hero) {
      req.flash('error_msg', 'Superhero not found');
      return res.redirect(`/superhero/${heroId}`);
    }
    
    // Add to favorites if not already there
    if (!user.favoriteHeroes.includes(heroId)) {
      user.favoriteHeroes.push(heroId);
      await user.save();
      req.flash('success_msg', `${hero.name} added to favorites`);
    } else {
      req.flash('info_msg', `${hero.name} is already in your favorites`);
    }
    
    res.redirect(`/superhero/${heroId}`);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    req.flash('error_msg', 'Failed to add superhero to favorites');
    res.redirect('/');
  }
};

/**
 * Remove a superhero from favorites
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const heroId = parseInt(req.params.id);
    
    // Find user
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect(`/superhero/${heroId}`);
    }
    
    // Check if hero exists
    const hero = await Superhero.findOne({ id: heroId });
    
    if (!hero) {
      req.flash('error_msg', 'Superhero not found');
      return res.redirect(`/superhero/${heroId}`);
    }
    
    // Remove from favorites
    const index = user.favoriteHeroes.indexOf(heroId);
    if (index !== -1) {
      user.favoriteHeroes.splice(index, 1);
      await user.save();
      req.flash('success_msg', `${hero.name} removed from favorites`);
    } else {
      req.flash('info_msg', `${hero.name} is not in your favorites`);
    }
    
    // Redirect back to referring page or profile
    const referer = req.headers.referer || '/profile';
    res.redirect(referer);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    req.flash('error_msg', 'Failed to remove superhero from favorites');
    res.redirect('/profile');
  }
};
