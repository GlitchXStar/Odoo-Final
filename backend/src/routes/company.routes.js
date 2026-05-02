const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createCompanySchema, updateCompanySchema } = require('../validations/company.validation');
const { ROLES } = require('../config/constants');

// Public: get companies (for registration dropdown)
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// Admin only
router.post('/', authMiddleware, roleMiddleware(ROLES.ADMIN), validate(createCompanySchema), companyController.createCompany);
router.put('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), validate(updateCompanySchema), companyController.updateCompany);

module.exports = router;
