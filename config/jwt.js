// config/jwt.js - JWT configuration
module.exports = {
  secret: process.env.JWT_SECRET || 'your_superhero_jwt_secret_key_change_in_production',
  options: {
    expiresIn: '7d', // Token expiration time (7 days)
    issuer: 'superhero-app'
  },  cookie: {
    httpOnly: true, // Prevents JavaScript access
    secure: false, // Set to false to allow HTTP access
    sameSite: 'lax', // Changed to 'lax' to be more compatible with different browsers
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
};
