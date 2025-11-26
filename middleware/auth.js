const jwt = require('jsonwebtoken');
const dbmod = require('../data/database');
const { ObjectId } = require('mongodb');

const isAuthenticated = async (req, res, next) => {
  // Allow session-based authenticated users
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // Fallback to Bearer token (JWT)
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'You do not have access.' });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'CHANGE_ME');
    const db = dbmod.getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id) });
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

module.exports = { isAuthenticated };
