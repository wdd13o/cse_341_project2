const express = require('express');
const router = express.Router();
const authorsController = require('../controllers/authors');

// GET /authors
router.get('/', authorsController.getAll);

// GET /authors/:id
router.get('/:id', authorsController.getSingle);

// POST /authors
router.post('/', authorsController.create);

// PUT /authors/:id
router.put('/:id', authorsController.update);

// DELETE /authors/:id
router.delete('/:id', authorsController.remove);

module.exports = router;
