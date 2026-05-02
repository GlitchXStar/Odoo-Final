const express = require('express');
const router = express.Router();
const salaryStructureController = require('../controllers/salaryStructure.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createSalaryStructureSchema, updateSalaryStructureSchema } = require('../validations/salaryStructure.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/', roleMiddleware(ROLES.ADMIN, ROLES.PAYROLL_OFFICER, ROLES.HR_OFFICER), salaryStructureController.getAllSalaryStructures);
router.get('/user/:userId', roleMiddleware(ROLES.ADMIN, ROLES.PAYROLL_OFFICER, ROLES.HR_OFFICER), salaryStructureController.getSalaryStructure);
router.get('/user/:userId/active', roleMiddleware(ROLES.ADMIN, ROLES.PAYROLL_OFFICER, ROLES.HR_OFFICER), salaryStructureController.getActiveSalaryStructure);
router.post('/', roleMiddleware(ROLES.ADMIN, ROLES.PAYROLL_OFFICER), validate(createSalaryStructureSchema), salaryStructureController.createSalaryStructure);
router.put('/:id', roleMiddleware(ROLES.ADMIN, ROLES.PAYROLL_OFFICER), validate(updateSalaryStructureSchema), salaryStructureController.updateSalaryStructure);

module.exports = router;
