const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Users Api',
    description: 'Users Api'
  },
  host: process.env.RENDER_HOST || 'localhost:3000',
  // For local testing prefer http so Swagger UI won't try https://localhost
  schemes: ['http']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js', './routes/users.js'];

// this will generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);
