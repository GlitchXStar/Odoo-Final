const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const getAllEmployees = async (companyId, { page = 1, limit = 20, status, department }) => {
  const offset = (page - 1) * limit;
  let sql = `SELECT ep.*, u.email, u.login_id, u.first_name, u.last_name, u.phone, r.name AS role_name
             FROM employee_profiles ep
             INNER JOIN users u ON ep.user_id = u.id
             INNER JOIN roles r ON u.role_id = r.id
             WHERE ep.company_id = $1`;
  const params = [companyId];
  let idx = 2;

  if (status) {
    sql += ` AND ep.status = $${idx++}`;
    params.push(status);
  }
  if (department) {
    sql += ` AND ep.department = $${idx++}`;
    params.push(department);
  }

  const countSql = sql.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM');
  const countResult = await query(countSql, params);
  const total = parseInt(countResult.rows[0].count);

  sql += ` ORDER BY ep.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  return {
    employees: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getEmployeeById = async (id, companyId) => {
  const result = await query(
    `SELECT ep.*, u.email, u.login_id, u.first_name, u.last_name, u.phone, r.name AS role_name
     FROM employee_profiles ep
     INNER JOIN users u ON ep.user_id = u.id
     INNER JOIN roles r ON u.role_id = r.id
     WHERE ep.id = $1 AND ep.company_id = $2`,
    [id, companyId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Employee profile not found.', 404);
  }

  return result.rows[0];
};

const getEmployeeByUserId = async (userId, companyId) => {
  const result = await query(
    `SELECT ep.*, u.email, u.login_id, u.first_name, u.last_name, u.phone, r.name AS role_name
     FROM employee_profiles ep
     INNER JOIN users u ON ep.user_id = u.id
     INNER JOIN roles r ON u.role_id = r.id
     WHERE ep.user_id = $1 AND ep.company_id = $2`,
    [userId, companyId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Employee profile not found.', 404);
  }

  return result.rows[0];
};

const createEmployee = async (companyId, data) => {
  const result = await query(
    `INSERT INTO employee_profiles
       (user_id, company_id, employee_code, department, designation, date_of_joining,
        employment_type, status, manager_id, date_of_birth, gender, blood_group,
        emergency_contact_name, emergency_contact_phone, permanent_address, current_address,
        pan_number, aadhar_number, bank_account_number, bank_name, bank_ifsc)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     RETURNING *`,
    [data.userId, companyId, data.employeeCode, data.department, data.designation,
     data.dateOfJoining, data.employmentType, data.status || 'Active', data.managerId,
     data.dateOfBirth, data.gender, data.bloodGroup,
     data.emergencyContactName, data.emergencyContactPhone,
     data.permanentAddress, data.currentAddress,
     data.panNumber, data.aadharNumber, data.bankAccountNumber, data.bankName, data.bankIfsc]
  );

  return result.rows[0];
};

const updateEmployee = async (id, companyId, updates) => {
  await getEmployeeById(id, companyId);

  const fields = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    department: 'department', designation: 'designation', employmentType: 'employment_type',
    status: 'status', managerId: 'manager_id', dateOfBirth: 'date_of_birth',
    gender: 'gender', bloodGroup: 'blood_group', emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone', permanentAddress: 'permanent_address',
    currentAddress: 'current_address', panNumber: 'pan_number', aadharNumber: 'aadhar_number',
    bankAccountNumber: 'bank_account_number', bankName: 'bank_name', bankIfsc: 'bank_ifsc',
    dateOfLeaving: 'date_of_leaving', profilePhotoUrl: 'profile_photo_url',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (updates[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      params.push(updates[key]);
    }
  }

  if (fields.length === 0) {
    throw new AppError('No fields to update.', 400);
  }

  params.push(id, companyId);
  const result = await query(
    `UPDATE employee_profiles SET ${fields.join(', ')} WHERE id = $${idx++} AND company_id = $${idx++} RETURNING *`,
    params
  );

  return result.rows[0];
};

module.exports = { getAllEmployees, getEmployeeById, getEmployeeByUserId, createEmployee, updateEmployee };
