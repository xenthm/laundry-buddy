const User = require('../models/User');
const Machine = require('../models/Machine');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    res.json({
      user: req.user,
      machineDetails: req.machineDetails,
    });
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
    if (req.user.watchedMachines.indexOf(req.machine.machineId) != -1) {
      return res.status(400).json({ msg: `Already watching machine '${req.machine.machineId}'` });
    }
    req.user.watchedMachines.push(req.machine.machineId); // sorting can happen here

    await req.user.save();
    res.json({ msg: `Now watching machine '${req.machine.machineId}'` });
  } catch (err) {
    next(err);
  }
};

// Remove watched machine
exports.removeMachine = async (req, res, next) => {
  const { all } = req.body;

  try {
    if (all) {
      req.user.watchedMachines = undefined;
      await req.user.save();
      res.json({ msg: 'Stopped watching all machines' });
    } else {
      const index = req.user.watchedMachines.indexOf(req.machine.machineId);
      if (index === -1) {
        return res.status(400).json({ msg: `Was not watching machine '${req.machine.machineId}'` });
      }
      req.user.watchedMachines.splice(index, 1);
      if (req.user.watchedMachines.length === 0) {
        req.user.watchedMachines = undefined;
      }
      await req.user.save();
      res.json({ msg: `Stopped watching machine '${req.machine.machineId}'` });
    }
  } catch (err) {
    next(err);
  }
};