const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { runPayrollSchema } = require('../validations/payroll.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.post('/run', roleMiddleware(ROLES.ADMIN, ROLES.PAYROLL_OFFICER), validate(runPayrollSchema), payrollController.runPayroll);
router.get('/', payrollController.getPayroll);

module.exports = router;
