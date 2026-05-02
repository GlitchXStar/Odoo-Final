const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  employeeCode: Joi.string().max(50).required(),
  department: Joi.string().max(100).allow(null, ''),
  designation: Joi.string().max(100).allow(null, ''),
  dateOfJoining: Joi.date().iso().required(),
  employmentType: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern').required(),
  status: Joi.string().valid('Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned').default('Active'),
  managerId: Joi.number().integer().positive().allow(null),
  dateOfBirth: Joi.date().iso().allow(null),
  gender: Joi.string().valid('Male', 'Female', 'Other', 'Prefer not to say').allow(null),
  bloodGroup: Joi.string().max(5).allow(null, ''),
  emergencyContactName: Joi.string().max(100).allow(null, ''),
  emergencyContactPhone: Joi.string().max(20).allow(null, ''),
  permanentAddress: Joi.string().allow(null, ''),
  currentAddress: Joi.string().allow(null, ''),
  panNumber: Joi.string().max(20).allow(null, ''),
  aadharNumber: Joi.string().max(20).allow(null, ''),
  bankAccountNumber: Joi.string().max(50).allow(null, ''),
  bankName: Joi.string().max(100).allow(null, ''),
  bankIfsc: Joi.string().max(20).allow(null, ''),
});

const updateEmployeeSchema = Joi.object({
  department: Joi.string().max(100),
  designation: Joi.string().max(100),
  employmentType: Joi.string().valid('Full-Time', 'Part-Time', 'Contract', 'Intern'),
  status: Joi.string().valid('Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'),
  managerId: Joi.number().integer().positive().allow(null),
  dateOfBirth: Joi.date().iso(),
  gender: Joi.string().valid('Male', 'Female', 'Other', 'Prefer not to say'),
  bloodGroup: Joi.string().max(5),
  emergencyContactName: Joi.string().max(100),
  emergencyContactPhone: Joi.string().max(20),
  permanentAddress: Joi.string(),
  currentAddress: Joi.string(),
  panNumber: Joi.string().max(20),
  aadharNumber: Joi.string().max(20),
  bankAccountNumber: Joi.string().max(50),
  bankName: Joi.string().max(100),
  bankIfsc: Joi.string().max(20),
  dateOfLeaving: Joi.date().iso().allow(null),
  profilePhotoUrl: Joi.string().max(500),
}).min(1);

module.exports = { createEmployeeSchema, updateEmployeeSchema };
