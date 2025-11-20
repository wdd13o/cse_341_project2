const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Project 2 API',
    description: 'Books and Authors API for Project 2'
  },
  host: process.env.RENDER_HOST || process.env.RENDER_EXTERNAL_URL || 'cse-341-project2-1dsv.onrender.com',
  // For local testing prefer http so Swagger UI won't try https://localhost
  schemes: ['http']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// this will generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
