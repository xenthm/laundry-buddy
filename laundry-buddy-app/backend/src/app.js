const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to handle errors
app.use

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).send('Server error');
});

module.exports = app;
