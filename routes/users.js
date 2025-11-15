const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

// GET /api/users - return all users
router.get('/', usersController.getAll);

// GET /api/users/:id - return single contact by id
router.get('/:id', usersController.getSingle);

// POST /api/contacts - create a new contact
router.post('/', usersController.create);

// PUT /api/contacts/:id - update an existing contact
router.put('/:id', usersController.update);

// DELETE /api/contacts/:id - delete a contact
router.delete('/:id', usersController.remove);

module.exports = router;
