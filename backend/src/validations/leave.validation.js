const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  leaveTypeId: Joi.number().integer().positive().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  totalDays: Joi.number().positive().required(),
  reason: Joi.string().max(500).allow(null, ''),
});

const rejectLeaveSchema = Joi.object({
  rejectionReason: Joi.string().max(500).required(),
});

module.exports = { applyLeaveSchema, rejectLeaveSchema };
