const shiftService = require('../services/shift.service');

const createShift = async (req, res, next) => {
  try {
    const shift = await shiftService.createShift(req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Shift created.', data: shift });
  } catch (err) {
    next(err);
  }
};

const getAllShifts = async (req, res, next) => {
  try {
    const shifts = await shiftService.getAllShifts(req.companyId);
    res.json({ success: true, data: shifts });
  } catch (err) {
    next(err);
  }
};

const updateShift = async (req, res, next) => {
  try {
    const shift = await shiftService.updateShift(parseInt(req.params.id), req.companyId, req.body);
    res.json({ success: true, message: 'Shift updated.', data: shift });
  } catch (err) {
    next(err);
  }
};

const assignShift = async (req, res, next) => {
  try {
    const assignment = await shiftService.assignShift(req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Shift assigned.', data: assignment });
  } catch (err) {
    next(err);
  }
};

module.exports = { createShift, getAllShifts, updateShift, assignShift };
