const salaryStructureService = require('../services/salaryStructure.service');

const createSalaryStructure = async (req, res, next) => {
  try {
    const result = await salaryStructureService.createSalaryStructure(req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Salary structure created.', data: result });
  } catch (err) {
    next(err);
  }
};

const getSalaryStructure = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await salaryStructureService.getSalaryStructure(req.companyId, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getActiveSalaryStructure = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await salaryStructureService.getActiveSalaryStructure(req.companyId, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const updateSalaryStructure = async (req, res, next) => {
  try {
    const result = await salaryStructureService.updateSalaryStructure(
      parseInt(req.params.id), req.companyId, req.body
    );
    res.json({ success: true, message: 'Salary structure updated.', data: result });
  } catch (err) {
    next(err);
  }
};

const getAllSalaryStructures = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const result = await salaryStructureService.getAllSalaryStructures(req.companyId, { activeOnly });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSalaryStructure, getSalaryStructure, getActiveSalaryStructure, updateSalaryStructure, getAllSalaryStructures };
