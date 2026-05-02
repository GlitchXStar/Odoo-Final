const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createEmployeeSchema, updateEmployeeSchema } = require('../validations/employee.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.PAYROLL_OFFICER), employeeController.getAllEmployees);
router.get('/me', employeeController.getMyProfile);
router.put('/me', employeeController.updateMyProfile);
router.get('/:id', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.PAYROLL_OFFICER), employeeController.getEmployeeById);
router.post('/create-with-user', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), employeeController.createEmployeeWithUser);
router.post('/', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(createEmployeeSchema), employeeController.createEmployee);
router.put('/:id', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(updateEmployeeSchema), employeeController.updateEmployee);
router.delete('/:id', roleMiddleware(ROLES.ADMIN), employeeController.deleteEmployee);

module.exports = router;
