const Joi = require('joi');

const createCompanySchema = Joi.object({
  name: Joi.string().max(255).required(),
  code: Joi.string().max(50).required(),
  email: Joi.string().email().allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  address: Joi.string().allow(null, ''),
  city: Joi.string().max(100).allow(null, ''),
  state: Joi.string().max(100).allow(null, ''),
  country: Joi.string().max(100).allow(null, ''),
  pincode: Joi.string().max(20).allow(null, ''),
  taxId: Joi.string().max(100).allow(null, ''),
  logoUrl: Joi.string().max(500).allow(null, ''),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().max(255),
  email: Joi.string().email(),
  phone: Joi.string().max(20),
  address: Joi.string(),
  city: Joi.string().max(100),
  state: Joi.string().max(100),
  country: Joi.string().max(100),
  pincode: Joi.string().max(20),
  taxId: Joi.string().max(100),
  logoUrl: Joi.string().max(500),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createCompanySchema, updateCompanySchema };
