const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { findMachine, getMachineDetails, findEarliestMachine } = require('../middlewares/machineMiddleware');
const { getUserProfile, updateUserProfile, changePassword, deleteUserAccount, forgotPassword, resetPassword, watchMachine, removeMachine, refreshWatched } = require('../controllers/userController');
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

// Route to delete user account
router.delete('/profile', deleteUserAccount);

// Route to watch machine
router.post('/watch-machine', findMachine, watchMachine);

// Route to watch earliest available machine
router.post('/watch-earliest-machine', findEarliestMachine, watchMachine);

// Route to refresh status of watched machines
router.post('/refresh', refreshWatched);

// Route to stop watching machine
router.delete('/watch-machine', findMachine, removeMachine);

module.exports = router;