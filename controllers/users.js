// Users API removed per project cleanup request.
// This module now returns 404 responses so routes that still reference it
// will fail gracefully instead of throwing module-not-found errors.
const notFoundHandler = (req, res) => res.status(404).json({ message: 'Users API removed' });

module.exports = {
  getAll: (req, res) => notFoundHandler(req, res),
  getSingle: (req, res) => notFoundHandler(req, res),
  create: (req, res) => notFoundHandler(req, res),
  update: (req, res) => notFoundHandler(req, res),
  remove: (req, res) => notFoundHandler(req, res),
  createUser: (req, res) => notFoundHandler(req, res),
  updateUser: (req, res) => notFoundHandler(req, res),
  deleteUser: (req, res) => notFoundHandler(req, res)
};
