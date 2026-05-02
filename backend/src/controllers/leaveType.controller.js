const leaveTypeService = require('../services/leaveType.service');

const createLeaveType = async (req, res, next) => {
  try {
    const result = await leaveTypeService.createLeaveType(req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Leave type created.', data: result });
  } catch (err) {
    next(err);
  }
};

const getAllLeaveTypes = async (req, res, next) => {
  try {
    const result = await leaveTypeService.getAllLeaveTypes(req.companyId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateLeaveType = async (req, res, next) => {
  try {
    const result = await leaveTypeService.updateLeaveType(parseInt(req.params.id), req.companyId, req.body);
    res.json({ success: true, message: 'Leave type updated.', data: result });
  } catch (err) {
    next(err);
  }
};

const deleteLeaveType = async (req, res, next) => {
  try {
    const result = await leaveTypeService.deleteLeaveType(parseInt(req.params.id), req.companyId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLeaveType, getAllLeaveTypes, updateLeaveType, deleteLeaveType };
