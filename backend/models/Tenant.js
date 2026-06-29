const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  roomId: { type: String, required: true },
  roomNumber: { type: String, required: true },
  joinDate: { type: String, required: true }, // e.g. YYYY-MM-DD
  rentPlan: { type: String, enum: ['Monthly', '6-Months', 'Yearly'], default: 'Monthly' },
  rentAmount: { type: Number, required: true },
  rentStatus: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  dueDate: { type: String, required: true }, // e.g. YYYY-MM-DD
  username: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = makeModel('tenants', TenantSchema);
