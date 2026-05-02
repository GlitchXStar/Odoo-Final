const Joi = require('joi');

const createSalaryStructureSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  effectiveFrom: Joi.date().iso().required(),
  effectiveTo: Joi.date().iso().allow(null),
  basic: Joi.number().positive().required(),
  hra: Joi.number().min(0).default(0),
  conveyanceAllowance: Joi.number().min(0).default(0),
  medicalAllowance: Joi.number().min(0).default(0),
  specialAllowance: Joi.number().min(0).default(0),
  bonus: Joi.number().min(0).default(0),
  otherAllowances: Joi.number().min(0).default(0),
  currency: Joi.string().max(10).default('INR'),
});

const updateSalaryStructureSchema = Joi.object({
  effectiveFrom: Joi.date().iso(),
  effectiveTo: Joi.date().iso().allow(null),
  basic: Joi.number().positive(),
  hra: Joi.number().min(0),
  conveyanceAllowance: Joi.number().min(0),
  medicalAllowance: Joi.number().min(0),
  specialAllowance: Joi.number().min(0),
  bonus: Joi.number().min(0),
  otherAllowances: Joi.number().min(0),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createSalaryStructureSchema, updateSalaryStructureSchema };
