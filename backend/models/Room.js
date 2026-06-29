const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const RoomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g. Single Sharing, Double Sharing, Triple Sharing
  rent: { type: Number, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = makeModel('rooms', RoomSchema);
