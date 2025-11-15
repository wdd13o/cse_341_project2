const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const swaggerUi = require('swagger-ui-express');

// Try to load the generated swagger.json (created by swagger-autogen prestart script).
// Fallback to the static ./swagger.js spec if the generated file is not present.
let swaggerSpec;
try {
  swaggerSpec = require('./swagger.json');
} catch (e) {
  try {
    swaggerSpec = require('./swagger');
  } catch (err) {
    swaggerSpec = {};
  }
}
const app = express();

const port = process.env.PORT || 3000;

// Use body-parser for JSON (matches project screenshots)
app.use(bodyParser.json());

// Simple request logger to help debug deployed requests (logs method, path, host)
app.use((req, res, next) => {
  console.log(`[request] ${req.method} ${req.originalUrl} Host:${req.headers.host}`);
  next();
});

// Allow CORS from any origin and accept common headers/methods
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Z-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Mount main routes and API routes
app.use('/', require('./routes'));
app.use('/api/contacts', require('./routes/users')); 
// Mount new W03 routes (match project2.rest which uses /books and /authors)
app.use('/books', require('./routes/books'));
app.use('/authors', require('./routes/authors'));

// Keep legacy route for project1 data (convenience)
app.get('/project1', async (req, res) => {
  try {
    let db;
    try {
      db = mongodb.getDatabase();
    } catch (e) {
      console.error('Database not initialized when handling /project1', e);
      return res.status(500).json({ message: 'Database not initialized', error: e.message });
    }

    const data = await db.collection('contacts').find({}).toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
  } catch (err) {
    console.error('Error in /project1 route:', err);
    res.status(500).json({ message: 'Error fetching project1 data', error: err.message });
  }
});

// Swagger UI (loads spec from ./swagger.js)
// Log requests to /api-docs for debugging
app.use('/api-docs', (req, res, next) => {
  console.log('[server] /api-docs request:', req.method, req.url);
  next();
});

// Serve swagger UI (fallback spec will be used by the route under /api-docs provided by routes/swagger.js)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Expose raw swagger.json at /swagger.json for debugging
const path = require('path');
const fs = require('fs');
app.get('/swagger.json', (req, res) => {
  const p = path.join(__dirname, 'swagger.json');
  if (!fs.existsSync(p)) return res.status(404).json({ message: 'swagger.json not found' });
  res.setHeader('Content-Type', 'application/json');
  res.send(fs.readFileSync(p, 'utf8'));
});

mongodb.initDb((err) => {
  if (err) {
    // Log the DB init error but start the server so the developer can see errors in routes
    console.error('Warning: database initialization failed. Server will start, but DB operations may fail.');
    console.error(err && err.message ? err.message : err);
  }
  app.listen(port, () => { console.log(`Node server running on port ${port}`); });
});
