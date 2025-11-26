const express = require('express');
const router = express.Router();
const passport = require('passport');

// Serve Swagger UI from routes/swagger.js
try {
	const swaggerRouter = require('./swagger');
	router.use('/', swaggerRouter);
} catch (e) {
	// ignore if swagger router isn't present
}

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
						<p>Swagger UI: <a href="/api-docs">/api-docs</a></p>
						
					</body>
				</html>
		`);
});

// (User routes removed)

// Project 2 routes
router.use('/books', booksRouter);
router.use('/authors', authorsRouter);

// Legacy login route — redirect to Google OAuth start
router.get('/login', (req, res) => res.redirect('/auth/google'));

// Google login route (starts OAuth)
router.get('/auth/google', (req, res, next) => {
	if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
		return res.status(501).send('Google OAuth is not configured on this server.');
	}
	return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Logout route - ends session and redirect to root
router.get('/logout', function (req, res, next) {
	req.logout(function (err) {
		if (err) return next(err);
		res.redirect('/');
	});
});

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