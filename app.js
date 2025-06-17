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
const debugRoutes = require('./routes/unified-debug'); // Use unified debug routes
const apiRoutes = require('./routes/api');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB with simple configuration
// Try local connection if VM connection fails
const vmMongoUri = process.env.MONGODB_URI || 'mongodb://10.12.87.70:27017/superhero-app';
const localMongoUri = 'mongodb://localhost:27017/superhero-app';

console.log(`Attempting to connect to MongoDB at: ${vmMongoUri}`);

// Try VM connection first, fall back to localhost
mongoose.connect(vmMongoUri)
  .then(() => {
    console.log('MongoDB connected successfully to VM');
    global.isVmEnvironment = true;
  })
  .catch(vmErr => {
    console.error('MongoDB VM connection error:', vmErr);
    console.log('Trying local MongoDB connection instead...');
    
    mongoose.connect(localMongoUri)
      .then(() => {
        console.log('MongoDB connected successfully to localhost');
        global.isVmEnvironment = false;
      })
      .catch(localErr => {
        console.error('MongoDB local connection error:', localErr);
        console.log('Could not connect to any MongoDB instance. Profile functionality may not work.');
        global.isVmEnvironment = false;
      });
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

// Protocol normalization middleware - critical for VM environment
app.use((req, res, next) => {
  // Get actual protocol, accounting for proxies
  let protocol = req.protocol;
  if (req.headers['x-forwarded-proto']) {
    protocol = req.headers['x-forwarded-proto'].split(',')[0];
  }
  
  // Store the actual protocol for use in the app
  req.actualProtocol = protocol;
  
  // For profile routes, ensure HTTP protocol only
  if (req.path.startsWith('/profile') && protocol === 'https') {
    console.log(`[PROTOCOL] Redirecting profile from HTTPS to HTTP: ${req.url}`);
    return res.redirect(`http://${req.headers.host}${req.originalUrl}`);
  }
  
  next();
});

// Simple middleware to log requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} (Protocol: ${req.actualProtocol || req.protocol})`);
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

// Add auth middleware to set user data
const { setUserData } = require('./middleware/auth');
app.use(setUserData);

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  
  // Determine if we're on the VM or localhost for URL generation
  const isVM = global.isVmEnvironment === true;
  console.log(`Request environment: ${isVM ? 'VM' : 'Local'}`);
  
  // Add base URL for templates to use in links
  // On VM, we need absolute urls with the correct protocol
  res.locals.baseUrl = `http://${req.headers.host}`;
  res.locals.isVmEnvironment = isVM;
  
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/superhero', superheroRoutes);

// Regular profile routes
app.use('/profile', profileRoutes);

app.use('/debug', debugRoutes); // Using unified debug routes only
app.use('/api', apiRoutes);

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
