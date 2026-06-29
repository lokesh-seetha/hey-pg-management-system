const mongoose = require('mongoose');
const { makeModel } = require('../config/db');

const PaymentSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  tenantName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  mode: { type: String, required: true }, // Cash, UPI, Card, NetBanking
  plan: { type: String, required: true }, // Monthly, 6-Months, Yearly
  transactionId: { type: String },
  monthYear: { type: String, required: true } // e.g. June 2026
}, { timestamps: true });

module.exports = makeModel('payments', PaymentSchema);
