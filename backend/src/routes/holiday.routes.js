const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holiday.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createHolidaySchema } = require('../validations/holiday.validation');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.post('/', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), validate(createHolidaySchema), holidayController.createHoliday);
router.get('/', holidayController.getAllHolidays);
router.delete('/:id', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), holidayController.deleteHoliday);

module.exports = router;
