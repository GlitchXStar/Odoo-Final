const leaveBalanceService = require('../services/leaveBalance.service');

const allocateBalance = async (req, res, next) => {
  try {
    const result = await leaveBalanceService.allocateBalance(req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Leave balance allocated.', data: result });
  } catch (err) {
    next(err);
  }
};

const getBalances = async (req, res, next) => {
  try {
    const { userId, year } = req.query;

    // Employees see only their own
    const effectiveUserId = req.user.roleName === 'Employee' ? req.user.id : (userId ? parseInt(userId) : undefined);

    const result = await leaveBalanceService.getBalances(req.companyId, {
      userId: effectiveUserId,
      year: year ? parseInt(year) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const bulkAllocate = async (req, res, next) => {
  try {
    const result = await leaveBalanceService.bulkAllocate(req.companyId, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { allocateBalance, getBalances, bulkAllocate };
