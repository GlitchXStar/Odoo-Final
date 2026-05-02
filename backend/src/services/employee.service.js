const bcrypt = require('bcryptjs');
const { query, getClient } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const getAllEmployees = async (companyId, { page = 1, limit = 20, status, department }) => {
  const offset = (page - 1) * limit;
  let sql = `SELECT ep.*, u.email, u.login_id, u.first_name, u.last_name, u.phone, u.role_id, r.name AS role_name
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

  const countResult = await query(`SELECT COUNT(*) FROM (${sql}) AS _count`, params);
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
    `SELECT ep.*, u.email, u.login_id, u.first_name, u.last_name, u.phone, u.role_id, r.name AS role_name
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
    `SELECT ep.*, u.email, u.login_id, u.first_name, u.last_name, u.phone, u.role_id, r.name AS role_name
     FROM employee_profiles ep
     INNER JOIN users u ON ep.user_id = u.id
     INNER JOIN roles r ON u.role_id = r.id
     WHERE ep.user_id = $1 AND ep.company_id = $2`,
    [userId, companyId]
  );

  return result.rows[0] || null;
};

const createEmployee = async (companyId, data) => {
  // Auto-generate employeeCode from user's login_id if not provided
  let employeeCode = data.employeeCode;
  if (!employeeCode && data.userId) {
    const userRow = await query('SELECT login_id FROM users WHERE id = $1', [data.userId]);
    employeeCode = userRow.rows[0]?.login_id || `EMP-${data.userId}`;
  }

  const result = await query(
    `INSERT INTO employee_profiles
       (user_id, company_id, employee_code, department, designation, date_of_joining,
        employment_type, status, manager_id, date_of_birth, gender, blood_group,
        emergency_contact_name, emergency_contact_phone, permanent_address, current_address,
        pan_number, aadhar_number, bank_account_number, bank_name, bank_ifsc)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     RETURNING *`,
    [data.userId, companyId, employeeCode, data.department, data.designation,
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
    gender: 'gender', maritalStatus: 'marital_status', bloodGroup: 'blood_group', emergencyContactName: 'emergency_contact_name',
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

const { generateSecurePassword, generateLoginId } = require('./auth.service');

const createEmployeeWithUser = async (companyId, { firstName, lastName, email, phone, roleId = 4, dateOfJoining, employmentType, department, designation, managerId, gender, maritalStatus, bloodGroup, dateOfBirth, emergencyContactName, emergencyContactPhone, permanentAddress, panNumber, bankAccountNumber, bankName, bankIfsc }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Check email uniqueness
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) throw new AppError('Email already registered.', 409);

    // 2. Verify company
    const company = await client.query('SELECT id, name FROM companies WHERE id = $1 AND is_active = true', [companyId]);
    if (company.rows.length === 0) throw new AppError('Company not found or inactive.', 404);

    // 3. Auto-generate password + loginId
    const tempPassword = generateSecurePassword(12);
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const joiningYear = dateOfJoining ? new Date(dateOfJoining).getFullYear() : new Date().getFullYear();
    const loginId = await generateLoginId(companyId, firstName, lastName, joiningYear);

    // 4. Create user
    const userResult = await client.query(
      `INSERT INTO users (company_id, role_id, email, password_hash, first_name, last_name, phone, login_id, is_first_login)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
       RETURNING id, company_id, role_id, email, first_name, last_name, phone, login_id, is_first_login, is_active, created_at`,
      [companyId, roleId, email, passwordHash, firstName, lastName, phone || null, loginId]
    );
    const user = userResult.rows[0];
    user.company_name = company.rows[0].name;

    // 5. Create employee profile (employeeCode = loginId)
    const empResult = await client.query(
      `INSERT INTO employee_profiles
         (user_id, company_id, employee_code, department, designation, date_of_joining,
          employment_type, status, manager_id, date_of_birth, gender, marital_status, blood_group,
          emergency_contact_name, emergency_contact_phone, permanent_address,
          pan_number, bank_account_number, bank_name, bank_ifsc)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Active',$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [user.id, companyId, loginId, department || null, designation || null,
       dateOfJoining || null, employmentType || 'Full-Time', managerId || null,
       dateOfBirth || null, gender || null, maritalStatus || null, bloodGroup || null,
       emergencyContactName || null, emergencyContactPhone || null, permanentAddress || null,
       panNumber || null, bankAccountNumber || null, bankName || null, bankIfsc || null]
    );

    await client.query('COMMIT');
    return { user, employee: empResult.rows[0], generatedPassword: tempPassword, loginId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getAllEmployees, getEmployeeById, getEmployeeByUserId, createEmployee, updateEmployee, createEmployeeWithUser };
