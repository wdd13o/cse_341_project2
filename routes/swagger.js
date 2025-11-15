const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// Serve the Swagger UI static assets
router.use('/api-docs', swaggerUi.serve);

// Return the swagger UI HTML (loads /swagger.json)
router.get('/api-docs', (req, res) => {
	console.log('[swagger] GET /api-docs requested');
	const swaggerDocumentPath = path.join(__dirname, '..', 'swagger.json');
	// serve the swagger-ui page which will fetch /swagger.json
	const swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocumentPath, 'utf8'));
	res.send(swaggerUi.generateHTML(swaggerDocument));
});

// Expose the generated swagger.json directly for debugging and external clients
router.get('/swagger.json', (req, res) => {
	const swaggerDocumentPath = path.join(__dirname, '..', 'swagger.json');
	if (!fs.existsSync(swaggerDocumentPath)) {
		return res.status(404).json({ message: 'swagger.json not found' });
	}
	const json = fs.readFileSync(swaggerDocumentPath, 'utf8');
	res.setHeader('Content-Type', 'application/json');
	res.send(json);
});

module.exports = router;
