// app.js - Main application file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const superheroRoutes = require('./routes/superhero');
const profileRoutes = require('./routes/profile');
const debugRoutes = require('./routes/debug');
const apiRoutes = require('./routes/api');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB with simple configuration
// Always connect to the VM address (10.12.87.70) for consistency
const mongoUri = 'mongodb://10.12.87.70:27017/superhero-app';
console.log(`Connecting to MongoDB at: ${mongoUri}`);

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Ensure MongoDB is running on the VM and properly configured');
  });

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up EJS layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

// Cookie parser middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Ensure HTTP protocol is used (disable HTTPS redirects)
app.use((req, res, next) => {
  // Log protocol information for debugging
  console.log(`[PROTOCOL DEBUG] URL: ${req.url}, Protocol: ${req.protocol}, X-Forwarded-Proto: ${req.headers['x-forwarded-proto'] || 'none'}`);
  
  // Force HTTP protocol for all routes
  if (req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https') {
    // If using HTTPS, redirect to HTTP
    const httpUrl = `http://${req.headers.host}${req.url}`;
    console.log(`[PROTOCOL REDIRECT] Redirecting to: ${httpUrl}`);
    return res.redirect(httpUrl);
  }
  
  // Add protocol info to locals for templates
  res.locals.currentProtocol = req.protocol;
  next();
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'superhero-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to false to allow HTTP access
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Import debug routes
const debugAuthRoutes = require('./routes/debug-auth');
const debugProfileRoutes = require('./routes/debug-profile');

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/superhero', superheroRoutes);
app.use('/profile', profileRoutes);
app.use('/debug', debugRoutes);
app.use('/api', apiRoutes);
app.use('/debug-auth', debugAuthRoutes);
app.use('/debug-profile', debugProfileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { 
    title: 'Error', 
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
