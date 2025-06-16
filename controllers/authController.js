// controllers/authController.js - Controller for authentication
const User = require('../models/User');

/**
 * Display login form
 */
exports.getLogin = (req, res) => {
  res.render('auth/login', { 
    title: 'Login',
    user: req.session.user
  });
};

/**
 * Handle login form submission
 */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Set user session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    req.flash('success_msg', 'You are now logged in');
    res.redirect('/');
    
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error_msg', 'An error occurred during login');
    res.redirect('/auth/login');
  }
};

/**
 * Display registration form
 */
exports.getRegister = (req, res) => {
  res.render('auth/register', { 
    title: 'Register',
    user: req.session.user
  });
};

/**
 * Handle registration form submission
 */
exports.postRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if email already exists
    let user = await User.findOne({ email });
    
    if (user) {
      req.flash('error_msg', 'Email is already registered');
      return res.redirect('/auth/register');
    }
    
    // Check if username already exists
    user = await User.findOne({ username });
    
    if (user) {
      req.flash('error_msg', 'Username is already taken');
      return res.redirect('/auth/register');
    }
    
    // Create new user
    user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
    
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'An error occurred during registration');
    res.redirect('/auth/register');
  }
};

/**
 * Handle logout
 */
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.redirect('/auth/login');
  });
};
