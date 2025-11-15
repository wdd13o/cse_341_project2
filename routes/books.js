const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books');

// GET /books
router.get('/', booksController.getAll);

// GET /books/:id
router.get('/:id', booksController.getSingle);

// POST /books
router.post('/', booksController.create);

// PUT /books/:id
router.put('/:id', booksController.update);

// DELETE /books/:id
router.delete('/:id', booksController.remove);

module.exports = router;
