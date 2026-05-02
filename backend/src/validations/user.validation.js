const Joi = require('joi');

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  email: Joi.string().email().max(255),
  phone: Joi.string().max(20).allow(null, ''),
  roleId: Joi.number().integer().positive(),
  isActive: Joi.boolean(),
  password: Joi.string().min(8).max(128),
}).min(1);

module.exports = { updateUserSchema };
