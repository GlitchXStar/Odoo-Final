const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const createShift = async (companyId, data) => {
  const result = await query(
    `INSERT INTO shifts (company_id, name, start_time, end_time, grace_minutes, half_day_hours, full_day_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [companyId, data.name, data.startTime, data.endTime, data.graceMinutes || 0,
     data.halfDayHours || 4, data.fullDayHours || 8]
  );
  return result.rows[0];
};

const getAllShifts = async (companyId) => {
  const result = await query(
    'SELECT * FROM shifts WHERE company_id = $1 AND is_active = true ORDER BY name',
    [companyId]
  );
  return result.rows;
};

const getShiftById = async (id, companyId) => {
  const result = await query(
    'SELECT * FROM shifts WHERE id = $1 AND company_id = $2',
    [id, companyId]
  );
  if (result.rows.length === 0) {
    throw new AppError('Shift not found.', 404);
  }
  return result.rows[0];
};

const updateShift = async (id, companyId, updates) => {
  await getShiftById(id, companyId);

  const fields = [];
  const params = [];
  let idx = 1;

  const fieldMap = {
    name: 'name', startTime: 'start_time', endTime: 'end_time',
    graceMinutes: 'grace_minutes', halfDayHours: 'half_day_hours',
    fullDayHours: 'full_day_hours', isActive: 'is_active',
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
    `UPDATE shifts SET ${fields.join(', ')} WHERE id = $${idx++} AND company_id = $${idx++} RETURNING *`,
    params
  );

  return result.rows[0];
};

const assignShift = async (companyId, data) => {
  // Verify user belongs to company
  const user = await query('SELECT id FROM users WHERE id = $1 AND company_id = $2', [data.userId, companyId]);
  if (user.rows.length === 0) {
    throw new AppError('User not found in this company.', 404);
  }

  // Verify shift belongs to company
  await getShiftById(data.shiftId, companyId);

  const result = await query(
    `INSERT INTO employee_shifts (user_id, company_id, shift_id, effective_from, effective_to)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.userId, companyId, data.shiftId, data.effectiveFrom, data.effectiveTo || null]
  );

  return result.rows[0];
};

const getEmployeeCurrentShift = async (userId, companyId, date) => {
  const result = await query(
    `SELECT s.* FROM employee_shifts es
     INNER JOIN shifts s ON es.shift_id = s.id
     WHERE es.user_id = $1 AND es.company_id = $2
       AND es.effective_from <= $3
       AND (es.effective_to IS NULL OR es.effective_to >= $3)
     ORDER BY es.effective_from DESC LIMIT 1`,
    [userId, companyId, date]
  );
  return result.rows[0] || null;
};

module.exports = { createShift, getAllShifts, getShiftById, updateShift, assignShift, getEmployeeCurrentShift };
