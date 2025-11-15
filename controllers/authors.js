const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const Joi = require('joi');

const COLLECTION = 'authors';

const authorSchema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().allow('').optional(),
  birthDate: Joi.date().iso().optional(),
  nationality: Joi.string().allow('').optional(),
  website: Joi.string().uri().allow('').optional()
});

const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().collection(COLLECTION).find({});
    const items = await result.toArray();
    res.status(200).json(items);
  } catch (err) {
    console.error('getAll authors error', err);
    res.status(500).json({ message: 'Error fetching authors', error: err.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const item = await mongodb.getDatabase().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ message: 'Author not found' });
    res.status(200).json(item);
  } catch (err) {
    console.error('getSingle author error', err);
    res.status(500).json({ message: 'Error fetching author', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { error, value } = authorSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const result = await mongodb.getDatabase().collection(COLLECTION).insertOne(value);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error('create author error', err);
    res.status(500).json({ message: 'Error creating author', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const { error, value } = authorSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });
    const response = await mongodb.getDatabase().collection(COLLECTION).replaceOne({ _id: new ObjectId(id) }, value);
    if (response.modifiedCount > 0) return res.status(204).end();
    return res.status(404).json({ message: 'Author not found or no change' });
  } catch (err) {
    console.error('update author error', err);
    res.status(500).json({ message: 'Error updating author', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const result = await mongodb.getDatabase().collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Author not found' });
    res.status(204).end();
  } catch (err) {
    console.error('delete author error', err);
    res.status(500).json({ message: 'Error deleting author', error: err.message });
  }
};

module.exports = { getAll, getSingle, create, update, remove };
