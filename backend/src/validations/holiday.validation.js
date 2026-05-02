const Joi = require('joi');

const createHolidaySchema = Joi.object({
  name: Joi.string().max(255).required(),
  date: Joi.date().iso().required(),
  type: Joi.string().valid('National', 'Optional', 'Company', 'Regional').default('National'),
  description: Joi.string().max(500).allow(null, ''),
});

module.exports = { createHolidaySchema };
