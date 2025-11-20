const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

// GET /api/users - return all users

// GET /api/users/:id - return single contact by id

// POST /api/contacts - create a new contact

// PUT /api/contacts/:id - update an existing contact

// DELETE /api/contacts/:id - delete a contact

// Users routes have been removed as part of project cleanup.
// Keep a 404 responder so any leftover references fail gracefully.
router.use((req, res) => res.status(404).json({ message: 'Users routes removed' }));

module.exports = router;
