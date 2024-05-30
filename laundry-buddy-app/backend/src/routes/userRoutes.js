const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { getUserProfile, updateUserProfile, changePassword, deleteUserAccount } = require('../controllers/userController');
const verifyPassword = require('../middlewares/passwordMiddleware');

const router = express.Router();

// Middleware to check authentication token
router.use(auth);

// Route to get user profile
router.get('/profile', getUserProfile);

// Route to update user profile
router.put('/profile', updateUserProfile);

// Route to change password
router.put('/change-password', verifyPassword, changePassword);

// TODO Route to send password reset email when user forgets password

// TODO Route to reset password

// Route to delete user account
router.delete('/profile', deleteUserAccount);

module.exports = router;
