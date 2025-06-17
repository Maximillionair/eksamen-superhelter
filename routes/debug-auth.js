// routes/debug-auth.js - Debug route to check authentication status
const express = require('express');
const router = express.Router();

// Debug endpoint to check authentication status
router.get('/auth-status', (req, res) => {
  // Sanitize data to avoid exposing sensitive information
  const authStatus = {
    session: {
      exists: !!req.session,
      userId: req.session && req.session.user ? 'exists' : 'not set',
      cookie: req.session ? {
        maxAge: req.session.cookie.maxAge,
        httpOnly: req.session.cookie.httpOnly,
        secure: req.session.cookie.secure,
        sameSite: req.session.cookie.sameSite || 'not set'
      } : 'no session',
    },
    cookies: {
      hasToken: !!req.cookies.token,
    },
    headers: {
      host: req.headers.host,
      referer: req.headers.referer || 'none',
      userAgent: req.headers['user-agent'],
      protocol: req.protocol,
      secure: req.secure,
      xForwardedProto: req.headers['x-forwarded-proto'] || 'none',
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'not set'
    }
  };
  
  res.json(authStatus);
});

module.exports = router;
