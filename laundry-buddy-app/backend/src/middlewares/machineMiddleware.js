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
    let query = Machine.findOne({ machineType: earliestMachineType, state: 'off', machineId: { $ne: 'test' } }).select('-_id')

    if (earliestMachineFloor != 'all') {
      // Create base query for machines of the given type, floor, and not equal to 'test'
      query = query.where({ floor: earliestMachineFloor });
    }

    // Try finding a machine that is off first
    req.machine = await query.exec();

    // If no 'off' machine is found, modify the query to remove the state condition
    if (!req.machine) {
      query = query.clone().where({ state: { $exists: true } }).sort({ endTime: 1 });
      req.machine = await query.exec();
    }

    if (!req.machine) {
      return res.status(404).json({ msg: `Earliest ${earliestMachineType}${earliestMachineFloor === 'all' ? '' : ` from floor '${earliestMachineFloor}'`} not found` });
    } next();
  } catch (err) {
    next(err);
  }
};