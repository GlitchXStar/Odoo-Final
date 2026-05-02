const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { applyLeaveSchema, rejectLeaveSchema } = require('../validations/leave.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.post('/apply', validate(applyLeaveSchema), leaveController.applyLeave);
router.get('/', leaveController.getLeaves);
router.put('/:id/approve', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.PAYROLL_OFFICER), leaveController.approveLeave);
router.put('/:id/reject', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.PAYROLL_OFFICER), validate(rejectLeaveSchema), leaveController.rejectLeave);

module.exports = router;
