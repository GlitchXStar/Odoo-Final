const dashboardService = require('../services/dashboard.service');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.companyId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

const getDepartmentBreakdown = async (req, res, next) => {
  try {
    const data = await dashboardService.getDepartmentBreakdown(req.companyId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data = await dashboardService.getRecentActivity(req.companyId, limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getDepartmentBreakdown, getRecentActivity };
