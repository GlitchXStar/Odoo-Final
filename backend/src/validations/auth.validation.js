const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  phone: Joi.string().max(20).allow(null, ''),
  companyId: Joi.number().integer().positive(),
  roleId: Joi.number().integer().positive().required(),
  dateOfJoining: Joi.date().iso().allow(null),
});

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'string.empty': 'Email or Login ID is required.',
  }),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one digit, and one special character (!@#$%&*).',
    }),
});

const requestOtpSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'string.empty': 'Email or Login ID is required.',
  }),
});

const verifyOtpSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'string.empty': 'Email or Login ID is required.',
  }),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'OTP must be exactly 6 digits.',
    'string.pattern.base': 'OTP must be exactly 6 digits.',
  }),
});

const registerAdminSchema = Joi.object({
  // Admin personal details
  firstName: Joi.string().min(1).max(100).required(),
  lastName:  Joi.string().min(1).max(100).required(),
  email:     Joi.string().email().required(),
  phone:     Joi.string().max(20).allow(null, ''),
  password:  Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])/)
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, digit and a special character (!@#$%&*).',
    }),

  // Company details
  companyName:    Joi.string().min(2).max(200).required(),
  companyCode:    Joi.string().alphanum().min(2).max(20).required()
    .messages({ 'string.alphanum': 'Company code must be alphanumeric (letters and numbers only).' }),
  companyEmail:   Joi.string().email().allow(null, ''),
  companyPhone:   Joi.string().max(20).allow(null, ''),
  companyAddress: Joi.string().max(500).allow(null, ''),
  companyCity:    Joi.string().max(100).allow(null, ''),
  companyState:   Joi.string().max(100).allow(null, ''),
  companyCountry: Joi.string().max(100).default('India'),
  companyPincode: Joi.string().max(20).allow(null, ''),
});

const resetPasswordSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'string.empty': 'Email or Login ID is required.',
  }),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'OTP must be exactly 6 digits.',
    'string.pattern.base': 'OTP must be exactly 6 digits.',
  }),
  newPassword: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one digit, and one special character (!@#$%&*).',
    }),
});

module.exports = { registerAdminSchema, createUserSchema, loginSchema, changePasswordSchema, requestOtpSchema, verifyOtpSchema, resetPasswordSchema };
