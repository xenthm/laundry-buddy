const User = require('../models/User');
const Machine = require('../models/Machine');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    if (req.user.watchedMachines.length === 0) {
      req.user.watchedMachines = undefined;
    }
    res.json(
      req.user,
    );
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  const { username, email } = req.body;

  try {
    if (username === req.user.username) {
      return res.status(400).json({ msg: 'New username cannot be the same as current username' });
    }

    if (email === req.user.email) {
      return res.status(400).json({ msg: 'New email cannot be the same as current email' });
    }

    req.user.username = username || req.user.username;
    req.user.email = email || req.user.email;

    await req.user.save();
    return res.json(req.user);
  } catch (err) {
    next(err);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    req.user.password = newPassword;
    await req.user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete user account
exports.deleteUserAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// Watch machine
exports.watchMachine = async (req, res, next) => {
  try {
    // if machine to be added is already in the array, return 400
    const currMachineId = req.machine.machineId;
    if (req.user.watchedMachines.some((element) => { return element.machineId === currMachineId; })) {
      return res.status(400).json({ msg: `Already watching machine '${currMachineId}'` });
    }
    req.user.watchedMachines.push(req.machine);

    // sorts watchedMachines in ascending endTime, placing machines that are off first
    req.user.watchedMachines.sort((a, b) => {
      // 
      if (a.state === 'off' || a.endTime < b.endTime) {
        return - 1
      }
      if (b.state === 'off' || a.endTime > b.endTime) {
        return 1;
      }
      return 0;
    });

    await req.user.save();
    res.json({
      machineId: currMachineId,
      watchedMachines: req.user.watchedMachines,
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshWatched = async (req, res, next) => {
  try {
    if (req.user.watchedMachines.length != 0) {
      for (let i = 0; i < req.user.watchedMachines.length; i++) {
        let machine = await Machine.findOne({ machineId: req.user.watchedMachines[i].machineId }).select('-_id');
        req.user.watchedMachines[i] = machine;
      }

      // sorts watchedMachines in ascending endTime, placing machines that are off first
      req.user.watchedMachines.sort((a, b) => {
        // 
        if (a.state === 'off' || a.endTime < b.endTime) {
          return - 1
        }
        if (b.state === 'off' || a.endTime > b.endTime) {
          return 1;
        }
        return 0;
      });
      await req.user.save();
    }
    res.json();
  } catch (err) {
    next(err);
  }
};

// Remove watched machine
exports.removeMachine = async (req, res, next) => {
  const { all } = req.body;

  try {
    const currMachineId = req.machine.machineId;
    if (all) {
      req.user.watchedMachines = undefined;
      await req.user.save();
      res.json({ msg: 'Stopped watching all machines' });
    } else {
      const index = req.user.watchedMachines.findIndex((element) => { return element.machineId === currMachineId; });
      if (index === -1) {
        return res.status(400).json({ msg: `Was not watching machine '${currMachineId}'` });
      }
      req.user.watchedMachines.splice(index, 1);
      if (req.user.watchedMachines.length === 0) {
        req.user.watchedMachines = undefined;
      }
      await req.user.save();
      res.json({ msg: `Stopped watching machine '${currMachineId}'` });
    }
  } catch (err) {
    next(err);
  }
};