const payrollService = require('../services/payroll.service');
const { AppError } = require('../middleware/errorHandler.middleware');
const auditService = require('../services/audit.service');

const runPayroll = async (req, res, next) => {
  try {
    const { userId, month, year } = req.body;

    let result;
    if (userId) {
      // Single employee payroll
      result = await payrollService.runPayroll(req.companyId, {
        userId, month, year, generatedBy: req.user.id,
      });

      await auditService.logAction({
        userId: req.user.id,
        companyId: req.companyId,
        action: 'PAYROLL_RUN',
        entityType: 'payroll',
        entityId: result.id,
        newValues: { userId, month, year, netSalary: result.net_salary },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({ success: true, message: 'Payroll processed.', data: result });
    } else {
      // Bulk payroll for all employees
      result = await payrollService.runBulkPayroll(req.companyId, {
        month, year, generatedBy: req.user.id,
      });

      await auditService.logAction({
        userId: req.user.id,
        companyId: req.companyId,
        action: 'BULK_PAYROLL_RUN',
        entityType: 'payroll',
        newValues: { month, year, processed: result.processed, failed: result.failed },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({ success: true, message: 'Bulk payroll completed.', data: result });
    }
  } catch (err) {
    next(err);
  }
};

const getPayroll = async (req, res, next) => {
  try {
    const { userId, month, year } = req.query;
    const isEmployee = req.user.roleName === 'Employee';

    // Employees only see their own; Admins/Officers see all (or filter by userId)
    const effectiveUserId = isEmployee ? req.user.id : (userId ? parseInt(userId) : null);

    const result = await payrollService.getPayrollByUser(req.companyId, effectiveUserId, {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const estimatePayroll = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) throw new AppError('userId is required.', 400);
    const result = await payrollService.estimatePayroll(req.companyId, parseInt(userId));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { runPayroll, getPayroll, estimatePayroll };
