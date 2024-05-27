const express = require('express');
const { getUserProfile, updateUserProfile, deleteUserAccount } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to get user profile
router.get('/profile', auth, getUserProfile);

// Route to update user profile
router.put('/profile', auth, updateUserProfile);

// Route to delete user account
router.delete('/profile', auth, deleteUserAccount);

module.exports = router;
