const express = require('express');
const router = express.Router();
const leaveBalanceController = require('../controllers/leaveBalance.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { allocateBalanceSchema, bulkAllocateSchema } = require('../validations/leaveBalance.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/', leaveBalanceController.getBalances);
router.post('/allocate', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(allocateBalanceSchema), leaveBalanceController.allocateBalance);
router.post('/bulk-allocate', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(bulkAllocateSchema), leaveBalanceController.bulkAllocate);

module.exports = router;
