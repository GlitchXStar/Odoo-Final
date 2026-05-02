const Joi = require('joi');

const createLeaveTypeSchema = Joi.object({
  name: Joi.string().max(100).required(),
  code: Joi.string().max(50).required(),
  annualQuota: Joi.number().integer().min(0).allow(null),
  isPaid: Joi.boolean().default(true),
  carryForward: Joi.boolean().default(false),
  maxCarryForward: Joi.number().integer().min(0).default(0),
});

const updateLeaveTypeSchema = Joi.object({
  name: Joi.string().max(100),
  code: Joi.string().max(50),
  annualQuota: Joi.number().integer().min(0),
  isPaid: Joi.boolean(),
  carryForward: Joi.boolean(),
  maxCarryForward: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createLeaveTypeSchema, updateLeaveTypeSchema };
