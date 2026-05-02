const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createShiftSchema, updateShiftSchema, assignShiftSchema } = require('../validations/shift.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.post('/', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(createShiftSchema), shiftController.createShift);
router.get('/', shiftController.getAllShifts);
router.put('/:id', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(updateShiftSchema), shiftController.updateShift);

module.exports = router;
