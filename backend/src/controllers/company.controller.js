const companyService = require('../services/company.service');

const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getAllCompanies();
    res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(parseInt(req.params.id));
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json({ success: true, message: 'Company created.', data: company });
  } catch (err) {
    next(err);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(parseInt(req.params.id), req.body);
    res.json({ success: true, message: 'Company updated.', data: company });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCompanies, getCompanyById, createCompany, updateCompany };
