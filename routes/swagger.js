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
	let swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocumentPath, 'utf8'));

	// Post-process generated spec: mark Bearer-protected operations as requiring Google OAuth
	try {
		for (const p of Object.keys(swaggerDocument.paths || {})) {
			const ops = swaggerDocument.paths[p];
			for (const method of Object.keys(ops)) {
				const op = ops[method];
				if (op && Array.isArray(op.security)) {
					// If the operation requires a Bearer token, append a note to the description
					const requiresBearer = op.security.some(s => Object.keys(s)[0] && (Object.keys(s)[0].toLowerCase().includes('bearer') || Object.keys(s)[0].toLowerCase().includes('authorization')));
					if (requiresBearer) {
						op.description = (op.description || '') + '\n\nNOTE: This endpoint requires authentication. Only users who authenticated via Google OAuth (user record with `googleId`) may perform create/update/delete operations.';
					}
				}
			}
		}
	} catch (e) {
		console.warn('[swagger] Failed to post-process swagger.json', e && e.message);
	}

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
