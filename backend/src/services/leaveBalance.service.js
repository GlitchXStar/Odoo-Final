const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const allocateBalance = async (companyId, data) => {
  // Check user belongs to company
  const user = await query('SELECT id FROM users WHERE id = $1 AND company_id = $2', [data.userId, companyId]);
  if (user.rows.length === 0) {
    throw new AppError('User not found in this company.', 404);
  }

  // Check leave type belongs to company
  const leaveType = await query(
    'SELECT id FROM leave_types WHERE id = $1 AND company_id = $2 AND is_active = true',
    [data.leaveTypeId, companyId]
  );
  if (leaveType.rows.length === 0) {
    throw new AppError('Leave type not found.', 404);
  }

  // Upsert leave balance
  const result = await query(
    `INSERT INTO leave_balances (user_id, company_id, leave_type_id, year, total_allocated, used, balance)
     VALUES ($1, $2, $3, $4, $5, 0, $5)
     ON CONFLICT (user_id, leave_type_id, year)
     DO UPDATE SET total_allocated = $5, balance = $5 - leave_balances.used
     RETURNING *`,
    [data.userId, companyId, data.leaveTypeId, data.year, data.totalAllocated]
  );

  return result.rows[0];
};

const getBalances = async (companyId, { userId, year }) => {
  let sql = `SELECT lb.*, lt.name AS leave_type_name, lt.code AS leave_type_code,
                    u.first_name, u.last_name
             FROM leave_balances lb
             INNER JOIN leave_types lt ON lb.leave_type_id = lt.id
             INNER JOIN users u ON lb.user_id = u.id
             WHERE lb.company_id = $1`;
  const params = [companyId];
  let idx = 2;

  if (userId) {
    sql += ` AND lb.user_id = $${idx++}`;
    params.push(userId);
  }
  if (year) {
    sql += ` AND lb.year = $${idx++}`;
    params.push(year);
  }

  sql += ' ORDER BY u.first_name, lt.name';
  const result = await query(sql, params);
  return result.rows;
};

const bulkAllocate = async (companyId, { leaveTypeId, year, totalAllocated }) => {
  // Get all active employees in company
  const employees = await query(
    `SELECT u.id FROM users u
     INNER JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE u.company_id = $1 AND u.is_active = true AND ep.status = 'Active'`,
    [companyId]
  );

  let allocated = 0;
  for (const emp of employees.rows) {
    await query(
      `INSERT INTO leave_balances (user_id, company_id, leave_type_id, year, total_allocated, used, balance)
       VALUES ($1, $2, $3, $4, $5, 0, $5)
       ON CONFLICT (user_id, leave_type_id, year)
       DO UPDATE SET total_allocated = $5, balance = $5 - leave_balances.used`,
      [emp.id, companyId, leaveTypeId, year, totalAllocated]
    );
    allocated++;
  }

  return { message: `Leave balance allocated to ${allocated} employees.`, count: allocated };
};

module.exports = { allocateBalance, getBalances, bulkAllocate };
