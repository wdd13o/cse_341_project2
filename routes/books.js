const router = require('express').Router();

const getBooksController = require('../controllers/books');

const { isAuthenticated } = require('../middleware/auth');

router.get('/', getBooksController.getAll);

router.get('/:id', getBooksController.getSingle);

router.post('/', isAuthenticated, getBooksController.create);

router.put('/:id', isAuthenticated, getBooksController.update);

router.delete('/:id', isAuthenticated, getBooksController.remove);

module.exports = router;
