const express = require('express');
const verifyPassword = require('../middlewares/passwordMiddleware');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', verifyPassword, login);

module.exports = router;
