const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const createLeaveType = async (companyId, data) => {
  const result = await query(
    `INSERT INTO leave_types (company_id, name, code, annual_quota, is_paid, carry_forward, max_carry_forward)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [companyId, data.name, data.code, data.annualQuota, data.isPaid !== false,
     data.carryForward || false, data.maxCarryForward || 0]
  );
  return result.rows[0];
};

const getAllLeaveTypes = async (companyId) => {
  const result = await query(
    'SELECT * FROM leave_types WHERE company_id = $1 AND is_active = true ORDER BY name',
    [companyId]
  );
  return result.rows;
};

const updateLeaveType = async (id, companyId, updates) => {
  const existing = await query(
    'SELECT * FROM leave_types WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  if (existing.rows.length === 0) {
    throw new AppError('Leave type not found.', 404);
  }

  const fields = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    name: 'name', code: 'code', annualQuota: 'annual_quota',
    isPaid: 'is_paid', carryForward: 'carry_forward',
    maxCarryForward: 'max_carry_forward', isActive: 'is_active',
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
    `UPDATE leave_types SET ${fields.join(', ')} WHERE id = $${idx++} AND company_id = $${idx++} RETURNING *`,
    params
  );

  return result.rows[0];
};

const deleteLeaveType = async (id, companyId) => {
  const existing = await query(
    'SELECT * FROM leave_types WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  if (existing.rows.length === 0) {
    throw new AppError('Leave type not found.', 404);
  }

  // Soft delete
  await query(
    'UPDATE leave_types SET is_active = false WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );

  return { message: 'Leave type deactivated.' };
};

module.exports = { createLeaveType, getAllLeaveTypes, updateLeaveType, deleteLeaveType };
