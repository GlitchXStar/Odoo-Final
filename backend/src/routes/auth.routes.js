const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createUserSchema, loginSchema, changePasswordSchema, requestOtpSchema, verifyOtpSchema } = require('../validations/auth.validation');
const { ROLES } = require('../config/constants');

// Public
router.post('/login', validate(loginSchema), authController.login);
router.post('/request-otp', validate(requestOtpSchema), authController.requestOTP);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOTP);

// Admin/HR only — create new user with auto-generated login_id + password
router.post(
  '/create-user',
  authMiddleware,
  companyScopeMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER),
  validate(createUserSchema),
  authController.createUser
);

// Authenticated — change own password (required on first login)
router.post(
  '/change-password',
  authMiddleware,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
