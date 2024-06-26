const Machine = require('../models/Machine');

exports.findMachine = async (req, res, next) => {
  const machineId = req.header('machineId');

  try {
    req.machine = await Machine.findOne({ machineId });

    if (!req.machine) {
      return res.status(404).json({ msg: 'Machine not found' });
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