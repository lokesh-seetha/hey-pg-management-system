require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const tenantRoutes = require('./routes/tenants');
const paymentRoutes = require('./routes/payments');
const grievanceRoutes = require('./routes/grievances');
const emergencyRoutes = require('./routes/emergencies');
const menuRoutes = require('./routes/menus');
const attendanceRoutes = require('./routes/attendance');
const feedbackRoutes = require('./routes/feedback');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);

// Base Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server and connect database
async function startServer() {
  // Connect database (auto-falls back to local json if mongo is down)
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Hey-PG Backend Server Running on Port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

startServer();
