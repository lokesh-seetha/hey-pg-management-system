const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const EmergencyAlertSchema = new mongoose.Schema({
  tenantName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, default: 'Medical Emergency Alert triggered!' },
  status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' }
}, { timestamps: true });

module.exports = makeModel('emergencyAlerts', EmergencyAlertSchema);
