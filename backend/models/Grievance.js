const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const GrievanceSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  tenantName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  category: { type: String, required: true }, // WiFi Down, Washing Machine, Electricity Outage, Plumbing, Other Issues
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = makeModel('grievances', GrievanceSchema);
