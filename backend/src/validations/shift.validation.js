const Joi = require('joi');

const createShiftSchema = Joi.object({
  name: Joi.string().max(100).required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required().messages({
    'string.pattern.base': 'startTime must be in HH:MM or HH:MM:SS format',
  }),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required().messages({
    'string.pattern.base': 'endTime must be in HH:MM or HH:MM:SS format',
  }),
  graceMinutes: Joi.number().integer().min(0).max(60).default(0),
  halfDayHours: Joi.number().min(1).max(12).default(4),
  fullDayHours: Joi.number().min(1).max(24).default(8),
});

const updateShiftSchema = Joi.object({
  name: Joi.string().max(100),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/),
  graceMinutes: Joi.number().integer().min(0).max(60),
  halfDayHours: Joi.number().min(1).max(12),
  fullDayHours: Joi.number().min(1).max(24),
  isActive: Joi.boolean(),
}).min(1);

const assignShiftSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  shiftId: Joi.number().integer().positive().required(),
  effectiveFrom: Joi.date().iso().required(),
  effectiveTo: Joi.date().iso().allow(null),
});

module.exports = { createShiftSchema, updateShiftSchema, assignShiftSchema };
