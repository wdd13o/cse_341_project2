const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const COLLECTION = 'users';

// swagger:tags [Users]
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users.
 */
const getAll = async (req, res) => {
  try {
  const result = await mongodb.getDatabase().collection(COLLECTION).find({});
    const contacts = await result.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(contacts);
  } catch (err) {
    console.error('getAll error', err);
    res.status(500).json({ message: 'Error fetching contacts', error: err.message });
  }
};

// swagger:tags [Users]
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a single user by id
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user object.
 */
const getSingle = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
  const userId = new ObjectId(id);
  const result = await mongodb.getDatabase().collection(COLLECTION).findOne({ _id: userId });
    if (!result) return res.status(404).json({ message: 'Contact not found' });
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (err) {
    console.error('getSingle error', err);
    res.status(500).json({ message: 'Error fetching contact', error: err.message });
  }
};

// swagger:tags [Users]
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: Created
 */
const create = async (req, res) => {
  try {
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;
    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  const contact = { firstName, lastName, email, favoriteColor, birthday };
  const result = await mongodb.getDatabase().collection(COLLECTION).insertOne(contact);
  // respond with the new id
  res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error('create error', err);
    res.status(500).json({ message: 'Error creating contact', error: err.message });
  }
};

// swagger:tags [Users]
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by id (full replace)
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       204:
 *         description: Updated successfully (no content)
 */
const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;
    if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const userId = new ObjectId(id);
    const user = { firstName, lastName, email, favoriteColor, birthday };
  const response = await mongodb.getDatabase().collection(COLLECTION).replaceOne({ _id: userId }, user);
    if (response.modifiedCount > 0) {
      return res.status(204).send();
    } else {
      return res.status(500).json(response.error || 'Some error occurred while updating the user.');
    }
  } catch (err) {
    console.error('update error', err);
    res.status(500).json({ message: 'Error updating contact', error: err.message });
  }
};

// swagger:tags [Users]
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by id
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted successfully (no content)
 */
const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const userId = new ObjectId(id);
  const result = await mongodb.getDatabase().collection(COLLECTION).deleteOne({ _id: userId });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(204).end();
  } catch (err) {
    console.error('remove error', err);
    res.status(500).json({ message: 'Error deleting contact', error: err.message });
  }
};

module.exports = {
  // existing API-style names
  getAll,
  getSingle,
  create,
  update,
  remove,
  // compatibility aliases (some codebases/tests expect these names)
  createUser: create,
  updateUser: update,
  deleteUser: remove
};
