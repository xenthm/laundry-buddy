const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resetRoutes = require('./routes/resetRoutes');
const machineRoutes = require('./routes/machineRoutes');

const app = express();

connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/', resetRoutes);
app.use('/api/machine', machineRoutes);

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send('Server error');
});

module.exports = app;