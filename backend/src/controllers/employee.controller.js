const employeeService = require('../services/employee.service');

const getAllEmployees = async (req, res, next) => {
  try {
    const { page, limit, status, department } = req.query;
    const result = await employeeService.getAllEmployees(req.companyId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
      department,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(parseInt(req.params.id), req.companyId);
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeByUserId(req.user.id, req.companyId);
    if (!employee) {
      return res.json({ success: true, data: null, message: 'No employee profile found. Ask your admin to create one.' });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.companyId, req.body);
    res.status(201).json({ success: true, message: 'Employee profile created.', data: employee });
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(parseInt(req.params.id), req.companyId, req.body);
    res.json({ success: true, message: 'Employee updated.', data: employee });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEmployees, getEmployeeById, getMyProfile, createEmployee, updateEmployee };
