const router = require('express').Router();

const getAuthorsController = require('../controllers/authors');

const { isAuthenticated } = require('../middleware/auth');

router.get('/', getAuthorsController.getAll);

router.get('/:id', getAuthorsController.getSingle);

router.post('/', isAuthenticated, getAuthorsController.create);

router.put('/:id', isAuthenticated, getAuthorsController.update);

router.delete('/:id', isAuthenticated, getAuthorsController.remove);

module.exports = router;

