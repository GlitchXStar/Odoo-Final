const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createCompanySchema, updateCompanySchema } = require('../validations/company.validation');
const { ROLES } = require('../config/constants');

// Authenticated — own company only (declared before /:id so Express won't match "me" as an ID)
router.get('/me', authMiddleware, companyController.getMyCompany);
router.put('/me', authMiddleware, roleMiddleware(ROLES.ADMIN), validate(updateCompanySchema), companyController.updateMyCompany);

// Admin only — create / manage by ID (super-admin / internal use)
router.post('/', authMiddleware, roleMiddleware(ROLES.ADMIN), validate(createCompanySchema), companyController.createCompany);
router.get('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), companyController.getCompanyById);
router.put('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), validate(updateCompanySchema), companyController.updateCompany);

module.exports = router;
