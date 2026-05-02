const employeeService = require('../services/employee.service');
const { sendCredentialsEmail } = require('../services/email.service');
const auditService = require('../services/audit.service');

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
    // Non-Admin cannot edit their own employee profile
    if (req.user.roleName !== 'Admin') {
      const target = await employeeService.getEmployeeById(parseInt(req.params.id), req.companyId);
      if (target.user_id === req.user.id) {
        return res.status(403).json({ success: false, message: 'You cannot modify your own employee profile.' });
      }
    }

    const employee = await employeeService.updateEmployee(parseInt(req.params.id), req.companyId, req.body);
    res.json({ success: true, message: 'Employee updated.', data: employee });
  } catch (err) {
    next(err);
  }
};

const createEmployeeWithUser = async (req, res, next) => {
  try {
    const result = await employeeService.createEmployeeWithUser(req.companyId, req.body);
    sendCredentialsEmail(result.user.email, {
      firstName: result.user.first_name,
      loginId: result.loginId,
      temporaryPassword: result.generatedPassword,
      companyName: result.user.company_name || '',
    }).catch((e) => console.error('Credentials email failed:', e.message));
    await auditService.logAction({
      userId: req.user.id, companyId: req.companyId,
      action: 'EMPLOYEE_CREATED', entityType: 'employee_profiles',
      entityId: result.employee.id,
      newValues: { email: result.user.email, loginId: result.loginId },
      ipAddress: req.ip, userAgent: req.get('user-agent'),
    }).catch(() => {});
    res.status(201).json({
      success: true,
      message: 'Employee created. Credentials emailed to the user.',
      data: { employee: result.employee, user: result.user, loginId: result.loginId },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEmployees, getEmployeeById, getMyProfile, createEmployee, updateEmployee, createEmployeeWithUser };
