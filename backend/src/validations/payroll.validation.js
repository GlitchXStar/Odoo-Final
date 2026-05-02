const Joi = require('joi');

const runPayrollSchema = Joi.object({
  userId: Joi.number().integer().positive().allow(null),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
});

module.exports = { runPayrollSchema };
