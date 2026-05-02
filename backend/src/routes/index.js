const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const employeeRoutes = require('./employee.routes');
const shiftRoutes = require('./shift.routes');
const employeeShiftRoutes = require('./employeeShift.routes');
const attendanceRoutes = require('./attendance.routes');
const leaveRoutes = require('./leave.routes');
const holidayRoutes = require('./holiday.routes');
const payrollRoutes = require('./payroll.routes');
const payslipRoutes = require('./payslip.routes');
const dashboardRoutes = require('./dashboard.routes');
const companyRoutes = require('./company.routes');
const salaryStructureRoutes = require('./salaryStructure.routes');
const leaveTypeRoutes = require('./leaveType.routes');
const leaveBalanceRoutes = require('./leaveBalance.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/shifts', shiftRoutes);
router.use('/employee-shifts', employeeShiftRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/holidays', holidayRoutes);
router.use('/payroll', payrollRoutes);
router.use('/payslip', payslipRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/companies', companyRoutes);
router.use('/salary-structures', salaryStructureRoutes);
router.use('/leave-types', leaveTypeRoutes);
router.use('/leave-balances', leaveBalanceRoutes);

module.exports = router;
