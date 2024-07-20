const Machine = require('../models/Machine');

exports.findMachine = async (req, res, next) => {
  const machineId = req.header('machineId');

  try {
    req.machine = await Machine.findOne({ machineId });

    if (!req.machine) {
      return res.status(404).json({ msg: `Machine '${machineId}' not found` });
    }

    next();
  } catch (err) {
    next(err);
  }
};

exports.findEarliestMachine = async (req, res, next) => {
  const { earliestMachineType } = req.body;

  if (!['washer', 'dryer'].includes(earliestMachineType)) {
    return res.status(400).json({ msg: "Invalid earliestMachineType, must be 'washer' or 'dryer'" });
  }

  try {
    // try finding an machine that has state 'off' first
    req.machine = await Machine.findOne({ state: 'off', machineType: earliestMachineType });
    // find the earliest available machine if all are in use
    if (!req.machine) {
      req.machine = await Machine.findOne({ machineType: earliestMachineType }).sort({ endTime: 1 });
    }

    if (!req.machine) {
      return res.status(404).json({ msg: `Earliest ${earliestMachineType} not found` });
    }

    next();
  } catch (err) {
    next(err);
  }
};

exports.getMachineDetails = async (req, res, next) => {
  try {
    if (req.user.watchedMachines) {
      for (const machineId of req.user.watchedMachines) {
        req.machineDetails = [];
        const machine = await Machine.findOne({ machineId });
        if (machine) {
          req.machineDetails.push({ // sorting can happen here
            machineId: machine.machineId,
            state: machine.state,
            endTime: machine.endTime,
          });
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}