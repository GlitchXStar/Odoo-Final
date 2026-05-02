const payslipService = require('../services/payslip.service');

const getPayslip = async (req, res, next) => {
  try {
    const payslip = await payslipService.getPayslip(parseInt(req.params.payroll_id), req.companyId);
    res.json({ success: true, data: payslip });
  } catch (err) {
    next(err);
  }
};

const downloadPayslipPDF = async (req, res, next) => {
  try {
    const result = await payslipService.generatePayslipPDF(parseInt(req.params.payroll_id), req.companyId);
    res.download(result.filePath, result.fileName);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPayslip, downloadPayslipPDF };
