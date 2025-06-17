// controllers/authController.js - Controller for authentication
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const jwtConfig = require('../config/jwt');

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
    const { email, password, rememberMe } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Login attempt failed: No user with email ${email}`);
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Compare password with bcrypt hashing
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log(`Login attempt failed: Invalid password for user ${email}`);
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    
    // Set user session
    const userData = user.generateAuthToken();
    req.session.user = userData;
    console.log(`User logged in successfully: ${userData.username} (${userData.id})`);
    
    // Always create a JWT token and store in cookie for session backup
    const token = generateToken(userData);
    
    // Set the token as an HTTP-only cookie with secure: false for development
    const cookieOptions = {
      ...jwtConfig.cookie,
      secure: false, // Force HTTP compatibility
      sameSite: 'lax',
      maxAge: rememberMe === 'on' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days if remember me, 1 day otherwise
    };
    res.cookie('token', token, cookieOptions);
    console.log('Authentication token set, remember me:', rememberMe === 'on');
    
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
    const { username, email, password, confirmPassword, rememberMe } = req.body;
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/auth/register');
    }
    
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
    
    // Automatically log in the user after registration
    // Generate user data for session
    const userData = user.generateAuthToken();
    req.session.user = userData;    // Generate and set JWT token in cookie if "remember me" is checked
    if (rememberMe === 'on') {
      const token = generateToken(userData);
      const cookieOptions = {
        ...jwtConfig.cookie,
        secure: false, // Force HTTP compatibility
        sameSite: 'lax'
      };
      res.cookie('token', token, cookieOptions);
    }
    
    req.flash('success_msg', `Welcome ${username}! Your account was created successfully.`);
    res.redirect('/'); // Redirect to home page instead of login
    
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
  // Clear the JWT token cookie with correct options
  res.clearCookie('token', {
    httpOnly: true, 
    secure: false,
    sameSite: 'lax'
  });
  
  // Destroy the session
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.redirect('/auth/login');
  });
};
