const express = require('express');
const { forgotPassword, resetPassword } = require('../controllers/resetController');

const router = express.Router();

// TODO Route to send password reset email when user forgets password
router.post('/forgot-password', forgotPassword);

// TODO Route to reset password
router.post('/reset-password/:token', resetPassword);

module.exports = router;