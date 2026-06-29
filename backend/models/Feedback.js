const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const FeedbackSchema = new mongoose.Schema({
  tenantName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  foodRating: { type: Number, required: true, min: 1, max: 5 },
  wifiRating: { type: Number, required: true, min: 1, max: 5 },
  cleanlinessRating: { type: Number, required: true, min: 1, max: 5 },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, default: '' },
  submittedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = makeModel('feedbacks', FeedbackSchema);
