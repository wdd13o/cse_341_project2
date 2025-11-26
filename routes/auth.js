const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Start Google OAuth flow
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ message: 'Google OAuth not configured on this server.' });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback with proper error handling
router.get('/google/callback', (req, res, next) => {
  // Use custom callback to handle errors
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ message: 'Google OAuth not configured on this server.' });
  }

  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('[auth/google/callback] OAuth error:', err.message);
      console.error('[auth/google/callback] Full error:', err);
      return res.status(401).json({ message: 'OAuth failed', error: err.message });
    }

    if (!user) {
      console.error('[auth/google/callback] No user returned from OAuth');
      return res.status(401).json({ message: 'Authentication failed', info });
    }

    // User authenticated, issue JWT and set session
    try {
      // Set the session user so session-based protected routes work
      req.session.user = user;
      
      const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME';
      const payload = { id: user._id.toString(), email: user.email || null };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
      
      console.log('[auth/google/callback] ✓ User authenticated and token issued');
      return res.redirect(`/auth/success?token=${token}`);
    } catch (tokenErr) {
      console.error('[auth/google/callback] Token generation error:', tokenErr.message);
      return res.status(500).json({ message: 'Token generation failed' });
    }
  })(req, res, next);
});

router.get('/success', async (req, res) => {
  const token = req.query.token || '';
  let name = 'User';
  try {
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        const db = require('../data/database').getDatabase();
        const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
        name = (user && user.displayName) || 'User';
      }
    }
  } catch (e) {
    name = 'User';
  }
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <title>Login Success</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
          h2 { color: #28a745; }
          .token-section { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 5px; }
          pre { background: #e8e8e8; padding: 10px; border-radius: 3px; text-align: left; overflow-x: auto; }
          .button-section { margin: 20px 0; }
          button { padding: 10px 20px; margin: 5px; font-size: 16px; cursor: pointer; border: none; border-radius: 4px; }
          .logout-btn { background-color: #dc3545; color: white; }
          .logout-btn:hover { background-color: #c82333; }
          .home-btn { background-color: #007bff; color: white; }
          .home-btn:hover { background-color: #0056b3; }
        </style>
      </head>
      <body>
        <h2>✓ Login Successful: ${name}</h2>
        <p>Welcome! You are now logged in.</p>
        
        <div class="token-section">
          <p><strong>Copy this token and use it in API requests:</strong></p>
          <pre>${token}</pre>
          <p>In your requests, include the header:</p>
          <pre>Authorization: Bearer ${token}</pre>
        </div>

        <div class="button-section">
          <button class="home-btn" onclick="location.href='/'">Go to Home</button>
          <button class="logout-btn" onclick="location.href='/auth/logout'">Logout</button>
        </div>
      </body>
    </html>
  `);
});

router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Authentication failed' });
});

// Local registration
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Invalid payload', details: error.details });

    const db = require('../data/database').getDatabase();
    const users = db.collection('users');
    const existing = await users.findOne({ email: value.email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(value.password, 10);
    const user = { email: value.email.toLowerCase(), password: hash, createdAt: new Date() };
    const r = await users.insertOne(user);
    user._id = r.insertedId;
    delete user.password;
    
    res.status(201).json({ message: 'Registered', user });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Local login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Invalid payload', details: error.details });

    const db = require('../data/database').getDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ email: value.email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(value.password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user._id.toString(), email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'CHANGE_ME', { expiresIn: '2h' });
    
    res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'CHANGE_ME');
    const db = require('../data/database').getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});

// Logout
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <html>
          <head>
            <title>Logged Out</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
              h2 { color: #dc3545; }
              button { padding: 10px 20px; margin: 5px; font-size: 16px; cursor: pointer; border: none; border-radius: 4px; background-color: #007bff; color: white; }
              button:hover { background-color: #0056b3; }
            </style>
          </head>
          <body>
            <h2>✓ Logged Out Successfully</h2>
            <p>You have been logged out. Your session has been cleared.</p>
            <button onclick="location.href='/'">Go to Home</button>
            <button onclick="location.href='/auth/google'">Login Again</button>
          </body>
        </html>
      `);
    });
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <html>
        <head>
          <title>Logged Out</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            h2 { color: #dc3545; }
            button { padding: 10px 20px; margin: 5px; font-size: 16px; cursor: pointer; border: none; border-radius: 4px; background-color: #007bff; color: white; }
            button:hover { background-color: #0056b3; }
          </style>
        </head>
        <body>
          <h2>✓ Logged Out</h2>
          <p>You have been logged out.</p>
          <button onclick="location.href='/'">Go to Home</button>
          <button onclick="location.href='/auth/google'">Login Again</button>
        </body>
      </html>
    `);
  }
});

module.exports = router;
