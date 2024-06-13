const Machine = require('../models/Machine');

// Controller to handle machine state requests
exports.setMachineState = async (req, res, next) => {
  const { machine_id, state } = req.body;

  if (!machine_id) {
    return res.status(400).json({ msg: 'machine_id is required' });
  }

  if (!['on', 'off'].includes(state)) {
    return res.status(400).json({ msg: 'Invalid state, must be <on> or <off>' });
  }

  try {
    let machine = await Machine.findOne({ machine_id });

    if (!machine) {
      machine = new Machine({ machine_id, state });
      await machine.save();
      return res.status(201).json({ msg: `${machine_id} created and set to ${state}` });
    }

    machine.state = state;
    await machine.save();
    res.json({ msg: `${machine_id} set to ${state}` });
  } catch (err) {
    next(err);
  }
};