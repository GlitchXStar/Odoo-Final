const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslip.controller');
const authMiddleware = require('../middleware/auth.middleware');
const companyScopeMiddleware = require('../middleware/companyScope.middleware');

router.use(authMiddleware, companyScopeMiddleware);

router.get('/:payroll_id', payslipController.getPayslip);
router.get('/:payroll_id/download', payslipController.downloadPayslipPDF);

module.exports = router;
