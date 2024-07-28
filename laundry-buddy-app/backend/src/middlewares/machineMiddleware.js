const Machine = require('../models/Machine');

exports.findMachine = async (req, res, next) => {
  const machineId = req.header('machineId');

  try {
    req.machine = await Machine.findOne({ machineId }).select('-_id');

    if (!req.machine) {
      return res.status(404).json({ msg: `Machine '${machineId}' not found` });
    }

    next();
  } catch (err) {
    next(err);
  }
};

exports.findEarliestMachine = async (req, res, next) => {
  const { earliestMachineType, earliestMachineFloor } = req.body;

  if (!['washer', 'dryer'].includes(earliestMachineType)) {
    return res.status(400).json({ msg: "Invalid earliestMachineType, must be 'washer' or 'dryer'" });
  }
  
  if ((typeof earliestMachineFloor != 'number' || earliestMachineFloor === 0) && earliestMachineFloor != 'all') {
    // -1 corresponds to B1, -2 to B2, etc.
    return res.status(400).json({ msg: "Invalid earliestMachineFloor, must be 'all' or a non-zero number" });
  }
  
  try {
    // exclude the test machine in all searches
    if (earliestMachineFloor === 'all') {
      // try finding an machine that has state 'off' first
      req.machine = await Machine.findOne({ state: 'off', machineType: earliestMachineType, machineId: {$ne: 'test'} });
      // find the earliest available machine if all are in use
      if (!req.machine) {
        req.machine = await Machine.findOne({ machineType: earliestMachineType, machineId: {$ne: 'test'} }).sort({ endTime: 1 });
      }
  
      if (!req.machine) {
        return res.status(404).json({ msg: `Earliest ${earliestMachineType} not found` });
      }
    } else {
      // try finding an machine that has state 'off' first
      req.machine = await Machine.findOne({ state: 'off', machineType: earliestMachineType, floor: earliestMachineFloor, machineId: {$ne: 'test'} });
      // find the earliest available machine if all are in use
      if (!req.machine) {
        req.machine = await Machine.findOne({ machineType: earliestMachineType, floor: earliestMachineFloor, machineId: {$ne: 'test'} }).sort({ endTime: 1 });
      }
  
      if (!req.machine) {
        return res.status(404).json({ msg: `Earliest ${earliestMachineType} from floor '${earliestMachineFloor}' not found` });
      }
    }
    

    next();
  } catch (err) {
    next(err);
  }
};