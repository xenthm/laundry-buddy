const express = require('express');
const verifyPassword = require('../middlewares/passwordMiddleware');
const { register, login, logout } = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', verifyPassword, login);

// Logout route
router.post('/logout', logout);

module.exports = router;