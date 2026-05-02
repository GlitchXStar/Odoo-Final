const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');
const { LEAVE_STATUS } = require('../config/constants');

const applyLeave = async (userId, companyId, data) => {
  // Check leave type exists for this company
  const leaveType = await query(
    'SELECT * FROM leave_types WHERE id = $1 AND company_id = $2 AND is_active = true',
    [data.leaveTypeId, companyId]
  );
  if (leaveType.rows.length === 0) {
    throw new AppError('Leave type not found.', 404);
  }

  // Check leave balance
  const year = new Date(data.startDate).getFullYear();
  const balance = await query(
    'SELECT * FROM leave_balances WHERE user_id = $1 AND leave_type_id = $2 AND year = $3',
    [userId, data.leaveTypeId, year]
  );

  if (balance.rows.length > 0 && parseFloat(balance.rows[0].balance) < data.totalDays) {
    throw new AppError(`Insufficient leave balance. Available: ${balance.rows[0].balance} days.`, 400);
  }

  // Check for overlapping leave requests
  const overlap = await query(
    `SELECT id FROM leave_requests 
     WHERE user_id = $1 AND company_id = $2 AND status IN ('Pending', 'Approved')
       AND start_date <= $3 AND end_date >= $4`,
    [userId, companyId, data.endDate, data.startDate]
  );

  if (overlap.rows.length > 0) {
    throw new AppError('Overlapping leave request exists.', 409);
  }

  const result = await query(
    `INSERT INTO leave_requests (user_id, company_id, leave_type_id, start_date, end_date, total_days, reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [userId, companyId, data.leaveTypeId, data.startDate, data.endDate, data.totalDays, data.reason]
  );

  return result.rows[0];
};

const getLeaves = async (companyId, { userId, status, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  let sql = `SELECT lr.*, u.first_name, u.last_name, u.email, lt.name AS leave_type_name
             FROM leave_requests lr
             INNER JOIN users u ON lr.user_id = u.id
             INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
             WHERE lr.company_id = $1`;
  const params = [companyId];
  let idx = 2;

  if (userId) {
    sql += ` AND lr.user_id = $${idx++}`;
    params.push(userId);
  }
  if (status) {
    sql += ` AND lr.status = $${idx++}`;
    params.push(status);
  }

  const countSql = sql.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM');
  const countResult = await query(countSql, params);
  const total = parseInt(countResult.rows[0].count);

  sql += ` ORDER BY lr.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  return {
    leaves: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const approveLeave = async (leaveId, companyId, approverId) => {
  const leave = await query(
    'SELECT * FROM leave_requests WHERE id = $1 AND company_id = $2',
    [leaveId, companyId]
  );

  if (leave.rows.length === 0) {
    throw new AppError('Leave request not found.', 404);
  }

  if (leave.rows[0].status !== LEAVE_STATUS.PENDING) {
    throw new AppError(`Cannot approve. Current status: ${leave.rows[0].status}`, 400);
  }

  const result = await query(
    `UPDATE leave_requests SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP
     WHERE id = $3 AND company_id = $4 RETURNING *`,
    [LEAVE_STATUS.APPROVED, approverId, leaveId, companyId]
  );

  return result.rows[0];
};

const rejectLeave = async (leaveId, companyId, approverId, rejectionReason) => {
  const leave = await query(
    'SELECT * FROM leave_requests WHERE id = $1 AND company_id = $2',
    [leaveId, companyId]
  );

  if (leave.rows.length === 0) {
    throw new AppError('Leave request not found.', 404);
  }

  if (leave.rows[0].status !== LEAVE_STATUS.PENDING) {
    throw new AppError(`Cannot reject. Current status: ${leave.rows[0].status}`, 400);
  }

  const result = await query(
    `UPDATE leave_requests SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, rejection_reason = $3
     WHERE id = $4 AND company_id = $5 RETURNING *`,
    [LEAVE_STATUS.REJECTED, approverId, rejectionReason, leaveId, companyId]
  );

  return result.rows[0];
};

module.exports = { applyLeave, getLeaves, approveLeave, rejectLeave };
