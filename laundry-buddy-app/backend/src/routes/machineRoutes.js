const express = require('express');
const router = express.Router();
const { findMachine, findEarliestMachine } = require('../middlewares/machineMiddleware');
const { getMachine, setMachineState, countMachines } = require('../controllers/machineController');

// Route for getting machine state
router.get('/', findMachine, getMachine);

// Route for getting earliest machine state
router.post('/earliest', findEarliestMachine, getMachine);

// Route for counting machines
router.post('/count', countMachines);

// Route for setting machine state
router.post('/', setMachineState);

module.exports = router;