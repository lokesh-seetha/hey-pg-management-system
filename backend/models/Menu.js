const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const DayMenuSchema = new mongoose.Schema({
  breakfast: { type: String, default: '' },
  lunch: { type: String, default: '' },
  dinner: { type: String, default: '' }
}, { _id: false });

const MenuSchema = new mongoose.Schema({
  Monday: { type: DayMenuSchema },
  Tuesday: { type: DayMenuSchema },
  Wednesday: { type: DayMenuSchema },
  Thursday: { type: DayMenuSchema },
  Friday: { type: DayMenuSchema },
  Saturday: { type: DayMenuSchema },
  Sunday: { type: DayMenuSchema }
}, { timestamps: true });

module.exports = makeModel('menus', MenuSchema);
