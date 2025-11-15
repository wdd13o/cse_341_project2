const dotenv = require('dotenv');
dotenv.config();

const MongoClient = require('mongodb').MongoClient;

let database;

/**
 * Initialize DB connection. If MONGODB_URL is not provided, use a local default.
 * Callback receives (err, db).
 */
const initDb = (callback) => {
  if (database) {
    console.log('DB is already initialized!');
    return callback(null, database);
  }

  const url = process.env.MONGODB_URL || 'mongodb://localhost:27017/cse_341_project1';
  if (!process.env.MONGODB_URL) {
    console.warn('MONGODB_URL not set — using local fallback:', url);
  }

  MongoClient.connect(url)
    .then((client) => {
      // If the connection string contained a DB name, client.db() will return it.
      // Otherwise, explicitly use a sensible default database name.
      try {
        database = client.db();
      } catch (e) {
        database = client.db('cse_341_project1');
      }
      console.log('Connected to MongoDB');
      callback(null, database);
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err && err.message);
      callback(err);
    });
};

const getDatabase = () => {
  if (!database) {
    throw Error('Database not initialized');
  }
  return database;
};

module.exports = {
  initDb,
  getDatabase
};
