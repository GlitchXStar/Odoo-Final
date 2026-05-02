const reportsService = require('../services/reports.service');

const getReportSummary = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getReportSummary(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getDepartmentReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getDepartmentReport(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getMonthlyTrend = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getMonthlyTrend(req.companyId, year);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getLeaveDistribution = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getLeaveDistribution(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getHeadcountReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getHeadcountReport(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getAttendanceReport(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getLeaveReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getLeaveReport(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getPayrollReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getPayrollReport(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getAttritionReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getAttritionReport(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getComplianceReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await reportsService.getComplianceReport(req.companyId, month, year);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getReportSummary, getDepartmentReport, getMonthlyTrend, getLeaveDistribution,
  getHeadcountReport, getAttendanceReport, getLeaveReport, getPayrollReport,
  getAttritionReport, getComplianceReport,
};
