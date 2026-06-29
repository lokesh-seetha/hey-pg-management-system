const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const AttendanceSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  tenantName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  breakfast: { type: Boolean, default: true }, // true = eating at PG, false = on leave
  lunch: { type: Boolean, default: true },
  dinner: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = makeModel('attendances', AttendanceSchema);
