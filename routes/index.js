const express = require('express');
const router = express.Router();

// Serve Swagger UI from routes/swagger.js
try {
	const swaggerRouter = require('./swagger');
	router.use('/', swaggerRouter);
} catch (e) {
	// ignore if swagger router isn't present
}

const usersController = require('../controllers/users');
const booksRouter = require('./books');
const authorsRouter = require('./authors');

// Root route - do NOT return DB data here. Direct users to /project1 for data.
router.get('/', (req, res) => {
		// Small HTML landing page pointing to the API endpoints for the Project 2 work
		res.setHeader('Content-Type', 'text/html');
		res.send(`
				<!doctype html>
				<html>
					<head>
						<meta charset="utf-8" />
						<title>Welcome</title>
						<style>body{font-family:Segoe UI, Roboto, Arial, sans-serif; padding:20px}</style>
					</head>
					<body>
						<h1><strong>Welcome</strong></h1>
						<p>This API provides CRUD endpoints for books and authors.</p>
						<ul>
							<li>Authors: <a href="/authors">/authors</a> (GET, POST, PUT, DELETE)</li>
							<li>Books: <a href="/books">/books</a> (GET, POST, PUT, DELETE)</li>
						</ul>
						<p>Swagger UI (if available): <a href="/api-docs">/api-docs</a></p>
						<p>Legacy users endpoints are under <code>/users</code> and single user at <code>/user/:id</code>.</p>
					</body>
				</html>
		`);
});

// Single user route (kept specific to avoid conflicts)
router.get('/user/:id', usersController.getSingle);

// Legacy plural routes for compatibility: /users and /users/:id
router.get('/users', usersController.getAll);
router.get('/users/:id', usersController.getSingle);

// Project 2 routes
router.use('/books', booksRouter);
router.use('/authors', authorsRouter);

module.exports = router;







//  "/api-docs": {
//       "get": {
//         "description": "",
//         "responses": {
//           "default": {
//             "description": ""
//           }
//         }
//       }
//     },