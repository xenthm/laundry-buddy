const Machine = require("../models/Machine");

// Get machine details
exports.getMachine = async (req, res, next) => {
  try {
    res.json(req.machine);
  } catch (err) {
    next(err);
  }
};

// Controller to handle machine state requests
exports.setMachineState = async (req, res, next) => {
  const { machineId, machineType, state, duration } = req.body;

  if (!machineId) {
    return res.status(400).json({ msg: "machineId is required" });
  }

  if (!["washer", "dryer"].includes(machineType)) {
    return res.status(400).json({ msg: "Invalid machineType, must be 'washer' or 'dryer'" });
  }

  if (!duration) {
    return res.status(400).json({ msg: "duration is required" });
  }

  let endTime;
  if (state === "on") {
    endTime = new Date(new Date().getTime() + duration);
  } else if (state === "off") {
    endTime = undefined;
  } else {
    return res.status(400).json({ msg: "Invalid state, must be 'on' or 'off'" });
  }

  try {
    let machine = await Machine.findOne({ machineId, machineType });
    let response;
    let responseSuffix = ` and ends in ${duration / 1000}s (${endTime})`;

    if (!machine) {
      machine = new Machine({ machineId, machineType, state, duration, endTime });
      await machine.save();

      response = { msg: `Machine not found. ${machineType} '${machineId}' created and set to ${state}` + (state === "on" ? responseSuffix : "") };
      console.log(response.msg);
      return res.status(201).json(response);
    }

    machine.state = state;
    machine.duration = duration;
    machine.endTime = endTime;
    await machine.save();

    response = { msg: `${machineType} '${machineId}' set to ${state}` + (state === "on" ? responseSuffix : "") };
    console.log(response.msg);
    res.json(response);
  } catch (err) {
    next(err);
  }
};