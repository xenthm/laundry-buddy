const express = require('express');
const router = express.Router();
const { setMachineState } = require('../controllers/machineController');

// Route for setting machine state
router.post('/set-state', setMachineState);

module.exports = router;