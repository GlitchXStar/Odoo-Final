const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const { ROLES } = require('../config/constants');

router.use(authMiddleware, companyScopeMiddleware);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/summary', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), attendanceController.getAttendanceSummary);
router.get('/', attendanceController.getAttendance);
router.put('/:id', roleMiddleware(ROLES.ADMIN, ROLES.HR_OFFICER), attendanceController.updateAttendance);

module.exports = router;
