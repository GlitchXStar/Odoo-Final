const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');
const { ATTENDANCE_STATUS } = require('../config/constants');
const shiftService = require('./shift.service');
const holidayService = require('./holiday.service');

const checkIn = async (userId, companyId) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  // Check for duplicate attendance
  const existing = await query(
    'SELECT id, check_in FROM attendance WHERE user_id = $1 AND date = $2',
    [userId, today]
  );

  if (existing.rows.length > 0 && existing.rows[0].check_in) {
    throw new AppError('Already checked in today.', 409);
  }

  // Check if today is a holiday
  const holiday = await holidayService.isHoliday(companyId, today);
  if (holiday) {
    // Still allow check-in but mark as Holiday
    if (existing.rows.length > 0) {
      const result = await query(
        `UPDATE attendance SET check_in = $1, status = $2, remarks = $3
         WHERE id = $4 RETURNING *`,
        [now, ATTENDANCE_STATUS.HOLIDAY, `Holiday: ${holiday.name}`, existing.rows[0].id]
      );
      return result.rows[0];
    }

    const result = await query(
      `INSERT INTO attendance (user_id, company_id, date, check_in, status, remarks)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, companyId, today, now, ATTENDANCE_STATUS.HOLIDAY, `Holiday: ${holiday.name}`]
    );
    return result.rows[0];
  }

  // Get assigned shift
  const shift = await shiftService.getEmployeeCurrentShift(userId, companyId, today);

  let lateMinutes = 0;
  let shiftId = null;

  if (shift) {
    shiftId = shift.id;
    // Calculate late minutes
    const shiftStart = parseTimeToMinutes(shift.start_time);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const graceMinutes = shift.grace_minutes || 0;

    if (currentMinutes > shiftStart + graceMinutes) {
      lateMinutes = currentMinutes - shiftStart;
    }
  }

  if (existing.rows.length > 0) {
    const result = await query(
      `UPDATE attendance SET check_in = $1, shift_id = $2, late_minutes = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [now, shiftId, lateMinutes, ATTENDANCE_STATUS.PRESENT, existing.rows[0].id]
    );
    return result.rows[0];
  }

  const result = await query(
    `INSERT INTO attendance (user_id, company_id, date, shift_id, check_in, late_minutes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [userId, companyId, today, shiftId, now, lateMinutes, ATTENDANCE_STATUS.PRESENT]
  );

  return result.rows[0];
};

const checkOut = async (userId, companyId) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const existing = await query(
    'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
    [userId, today]
  );

  if (existing.rows.length === 0 || !existing.rows[0].check_in) {
    throw new AppError('No check-in found for today. Please check in first.', 400);
  }

  if (existing.rows[0].check_out) {
    throw new AppError('Already checked out today.', 409);
  }

  const attendance = existing.rows[0];
  const checkInTime = new Date(attendance.check_in);
  const workHours = (now - checkInTime) / (1000 * 60 * 60); // in hours

  let overtimeMinutes = 0;
  let status = ATTENDANCE_STATUS.PRESENT;

  if (attendance.shift_id) {
    const shift = await shiftService.getShiftById(attendance.shift_id, companyId);
    const shiftEnd = parseTimeToMinutes(shift.end_time);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes > shiftEnd) {
      overtimeMinutes = currentMinutes - shiftEnd;
    }

    // Determine half-day vs full-day
    if (workHours < parseFloat(shift.half_day_hours)) {
      status = ATTENDANCE_STATUS.ABSENT;
    } else if (workHours < parseFloat(shift.full_day_hours)) {
      status = ATTENDANCE_STATUS.HALF_DAY;
    }
  }

  // Keep Holiday status if already set
  if (attendance.status === ATTENDANCE_STATUS.HOLIDAY) {
    status = ATTENDANCE_STATUS.HOLIDAY;
  }

  const result = await query(
    `UPDATE attendance SET check_out = $1, overtime_minutes = $2, work_hours = $3, status = $4
     WHERE id = $5 RETURNING *`,
    [now, overtimeMinutes, Math.round(workHours * 100) / 100, status, attendance.id]
  );

  return result.rows[0];
};

const getAttendance = async (companyId, { userId, date, month, year, page = 1, limit = 50 }) => {
  const offset = (page - 1) * limit;
  let sql = 'SELECT a.*, u.first_name, u.last_name, u.email FROM attendance a INNER JOIN users u ON a.user_id = u.id WHERE a.company_id = $1';
  const params = [companyId];
  let idx = 2;

  if (userId) {
    sql += ` AND a.user_id = $${idx++}`;
    params.push(userId);
  }
  if (date) {
    sql += ` AND a.date = $${idx++}`;
    params.push(date);
  }
  if (month && year) {
    sql += ` AND EXTRACT(MONTH FROM a.date) = $${idx++} AND EXTRACT(YEAR FROM a.date) = $${idx++}`;
    params.push(month, year);
  }

  const countSql = sql.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) FROM');
  const countResult = await query(countSql, params);
  const total = parseInt(countResult.rows[0].count);

  sql += ` ORDER BY a.date DESC, a.check_in DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  return {
    attendance: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

function parseTimeToMinutes(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

module.exports = { checkIn, checkOut, getAttendance };
