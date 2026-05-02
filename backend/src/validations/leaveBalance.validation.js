const Joi = require('joi');

const allocateBalanceSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  leaveTypeId: Joi.number().integer().positive().required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  totalAllocated: Joi.number().min(0).required(),
});

const bulkAllocateSchema = Joi.object({
  leaveTypeId: Joi.number().integer().positive().required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  totalAllocated: Joi.number().min(0).required(),
});

module.exports = { allocateBalanceSchema, bulkAllocateSchema };
