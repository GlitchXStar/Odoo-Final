const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const createSalaryStructure = async (companyId, data) => {
  // Verify user belongs to this company
  const userCheck = await query(
    'SELECT id FROM users WHERE id = $1 AND company_id = $2 AND is_active = true',
    [data.userId, companyId]
  );
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found in this company.', 404);
  }

  // Deactivate previous active structure for this user
  await query(
    `UPDATE salary_structure SET is_active = false
     WHERE user_id = $1 AND company_id = $2 AND is_active = true`,
    [data.userId, companyId]
  );

  const result = await query(
    `INSERT INTO salary_structure
       (user_id, company_id, effective_from, effective_to, basic, hra,
        conveyance_allowance, medical_allowance, special_allowance, bonus, other_allowances, currency)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [data.userId, companyId, data.effectiveFrom, data.effectiveTo || null,
     data.basic, data.hra || 0, data.conveyanceAllowance || 0,
     data.medicalAllowance || 0, data.specialAllowance || 0,
     data.bonus || 0, data.otherAllowances || 0, data.currency || 'INR']
  );

  return result.rows[0];
};

const getSalaryStructure = async (companyId, userId) => {
  const result = await query(
    `SELECT ss.*, u.first_name, u.last_name, u.email
     FROM salary_structure ss
     INNER JOIN users u ON ss.user_id = u.id
     WHERE ss.company_id = $1 AND ss.user_id = $2
     ORDER BY ss.effective_from DESC`,
    [companyId, userId]
  );
  return result.rows;
};

const getActiveSalaryStructure = async (companyId, userId) => {
  const result = await query(
    `SELECT * FROM salary_structure
     WHERE company_id = $1 AND user_id = $2 AND is_active = true
     ORDER BY effective_from DESC LIMIT 1`,
    [companyId, userId]
  );
  if (result.rows.length === 0) {
    throw new AppError('No active salary structure found.', 404);
  }
  return result.rows[0];
};

const updateSalaryStructure = async (id, companyId, updates) => {
  const existing = await query(
    'SELECT * FROM salary_structure WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  if (existing.rows.length === 0) {
    throw new AppError('Salary structure not found.', 404);
  }

  const fields = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    effectiveFrom: 'effective_from', effectiveTo: 'effective_to',
    basic: 'basic', hra: 'hra', conveyanceAllowance: 'conveyance_allowance',
    medicalAllowance: 'medical_allowance', specialAllowance: 'special_allowance',
    bonus: 'bonus', otherAllowances: 'other_allowances', isActive: 'is_active',
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
    `UPDATE salary_structure SET ${fields.join(', ')} WHERE id = $${idx++} AND company_id = $${idx++} RETURNING *`,
    params
  );

  return result.rows[0];
};

const getAllSalaryStructures = async (companyId, { activeOnly = false } = {}) => {
  let sql = `SELECT ss.*, u.first_name, u.last_name, u.email, ep.employee_code, ep.department
             FROM salary_structure ss
             INNER JOIN users u ON ss.user_id = u.id
             LEFT JOIN employee_profiles ep ON u.id = ep.user_id
             WHERE ss.company_id = $1`;

  if (activeOnly) {
    sql += ' AND ss.is_active = true';
  }

  sql += ' ORDER BY ss.created_at DESC';
  const result = await query(sql, [companyId]);
  return result.rows;
};

module.exports = { createSalaryStructure, getSalaryStructure, getActiveSalaryStructure, updateSalaryStructure, getAllSalaryStructures };
