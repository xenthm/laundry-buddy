const express = require('express');
const router = express.Router();
const { findMachine } = require('../middlewares/machineMiddleware');
const { getMachine, setMachineState } = require('../controllers/machineController');

// Route for getting machine state
router.get('/', findMachine, getMachine);

// Route for setting machine state
router.post('/', setMachineState);

module.exports = router;