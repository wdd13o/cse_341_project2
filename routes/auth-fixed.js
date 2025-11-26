const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const router = express.Router();

// Start Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback with proper error handling
router.get('/google/callback', (req, res, next) => {
  // Use custom callback to handle errors
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

    // User authenticated, issue JWT
    try {
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

router.get('/success', (req, res) => {
  const token = req.query.token || '';
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <head><title>Login Success</title></head>
      <body>
        <h2>✓ Login Successful</h2>
        <p>Copy this token and use it in API requests:</p>
        <pre>${token}</pre>
        <p>In your requests, include the header:</p>
        <pre>Authorization: Bearer ${token}</pre>
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
    const user = await db.collection('users').findOne({ _id: require('mongodb').ObjectId(payload.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.json({ message: 'Logout: discard the token on the client.' });
});

module.exports = router;
