const express = require('express');
const router = express.Router();
const leaveTypeController = require('../controllers/leaveType.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createLeaveTypeSchema, updateLeaveTypeSchema } = require('../validations/leaveType.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/', leaveTypeController.getAllLeaveTypes);
router.post('/', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(createLeaveTypeSchema), leaveTypeController.createLeaveType);
router.put('/:id', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(updateLeaveTypeSchema), leaveTypeController.updateLeaveType);
router.delete('/:id', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), leaveTypeController.deleteLeaveType);

module.exports = router;
