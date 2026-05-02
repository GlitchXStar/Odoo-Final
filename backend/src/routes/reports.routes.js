const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/auth.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/summary', reportsController.getReportSummary);
router.get('/departments', reportsController.getDepartmentReport);
router.get('/monthly-trend', reportsController.getMonthlyTrend);
router.get('/leave-distribution', reportsController.getLeaveDistribution);
router.get('/headcount', reportsController.getHeadcountReport);
router.get('/attendance', reportsController.getAttendanceReport);
router.get('/leave', reportsController.getLeaveReport);
router.get('/payroll', reportsController.getPayrollReport);
router.get('/attrition', reportsController.getAttritionReport);
router.get('/compliance', reportsController.getComplianceReport);

module.exports = router;
