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
    let response;

    if (!machine) {
      machine = new Machine({ machine_id, state });
      await machine.save();

      response = { msg: `Machine <${machine_id}> created and set to <${state}>` };
      console.log(response.msg);
      return res.status(201).json(response);
    }

    machine.state = state;
    await machine.save();

    response = { msg: `Machine <${machine_id}> set to <${state}>` };
    console.log(response.msg);
    res.json(response);
  } catch (err) {
    next(err);
  }
};