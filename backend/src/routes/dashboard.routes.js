const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/departments', dashboardController.getDepartmentBreakdown);
router.get('/activity', dashboardController.getRecentActivity);

module.exports = router;
