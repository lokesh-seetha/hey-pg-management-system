const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'tenant'], default: 'tenant' },
  name: { type: String, required: true },
  tenantId: { type: String, default: null } // Link to Tenant profile if role is 'tenant'
}, { timestamps: true });

module.exports = makeModel('users', UserSchema);
