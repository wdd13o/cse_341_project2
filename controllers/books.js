const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const Joi = require('joi');

const COLLECTION = 'books';

const bookSchema = Joi.object({
  title: Joi.string().required(),
  authorId: Joi.string().required(),
  isbn: Joi.string().required(),
  publishedDate: Joi.date().iso().required(),
  pages: Joi.number().integer().min(1).required(),
  genre: Joi.string().required(),
  summary: Joi.string().allow('').optional(),
  rating: Joi.number().min(0).max(5).required()
});

const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().collection(COLLECTION).find({});
    const items = await result.toArray();
    res.status(200).json(items);
  } catch (err) {
    console.error('getAll books error', err);
    res.status(500).json({ message: 'Error fetching books', error: err.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const item = await mongodb.getDatabase().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(item);
  } catch (err) {
    console.error('getSingle book error', err);
    res.status(500).json({ message: 'Error fetching book', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { error, value } = bookSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    // convert authorId to ObjectId when storing
    const doc = { ...value };
    try { doc.authorId = new ObjectId(value.authorId); } catch (e) { /* leave as-is if invalid */ }
    const result = await mongodb.getDatabase().collection(COLLECTION).insertOne(doc);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error('create book error', err);
    res.status(500).json({ message: 'Error creating book', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const { error, value } = bookSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const doc = { ...value };
    try { doc.authorId = new ObjectId(value.authorId); } catch (e) { }
    const response = await mongodb.getDatabase().collection(COLLECTION).replaceOne({ _id: new ObjectId(id) }, doc);
    if (response.modifiedCount > 0) return res.status(204).end();
    return res.status(404).json({ message: 'Book not found or no change' });
  } catch (err) {
    console.error('update book error', err);
    res.status(500).json({ message: 'Error updating book', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const result = await mongodb.getDatabase().collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Book not found' });
    res.status(204).end();
  } catch (err) {
    console.error('delete book error', err);
    res.status(500).json({ message: 'Error deleting book', error: err.message });
  }
};

module.exports = { getAll, getSingle, create, update, remove };
