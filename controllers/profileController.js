// controllers/profileController.js - Controller for user profile management
const User = require('../models/User');
const Superhero = require('../models/Superhero');

/**
 * Display user profile
 */
exports.getProfile = async (req, res) => {
  try {
    // Check if user is in session
    if (!req.session.user || !req.session.user.id) {
      console.error('[PROFILE] No user in session');
      req.flash('error_msg', 'You need to be logged in');
      return res.redirect('/auth/login');
    }

    const userId = req.session.user.id;
    console.log('[PROFILE] Getting profile for user:', userId);
    
    // Get user with favorites populated
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('[PROFILE] User not found in database:', userId);
      req.flash('error_msg', 'User not found');
      return res.redirect('/');
    }
    
    // Get favorite heroes
    const favoriteHeroes = await Superhero.find({
      id: { $in: user.favoriteHeroes || [] }
    });
    
    console.log('[PROFILE] Rendering profile page for user:', user.username);
    res.render('profile/index', {
      title: 'My Profile',
      user: req.session.user,
      profile: user,
      favoriteHeroes: favoriteHeroes || []
    });
  } catch (error) {
    console.error('[PROFILE] Error getting profile:', error);
    req.flash('error_msg', 'Failed to load profile. Please try logging in again.');
    return res.redirect('/auth/login');
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

/**
 * Change user password
 */
exports.changePassword = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user || !req.session.user.id) {
      req.flash('error_msg', 'You need to be logged in');
      return res.redirect('/auth/login');
    }
    
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      req.flash('error_msg', 'New passwords do not match');
      return res.redirect('/profile');
    }
    
    // Find user
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/profile');
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error_msg', 'Current password is incorrect');
      return res.redirect('/profile');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    req.flash('success_msg', 'Password updated successfully');
    res.redirect('/profile');
  } catch (error) {
    console.error('Error changing password:', error);
    req.flash('error_msg', 'Failed to change password');
    res.redirect('/profile');
  }
};
