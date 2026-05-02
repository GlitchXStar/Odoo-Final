const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { assignShiftSchema } = require('../validations/shift.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.post('/', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(assignShiftSchema), shiftController.assignShift);

module.exports = router;
