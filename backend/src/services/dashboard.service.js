const { query } = require('../config/db');

const getDashboardStats = async (companyId) => {
  const [employees, attendance, leaves, payroll] = await Promise.all([
    // Employee stats
    query(
      `SELECT
         COUNT(*) FILTER (WHERE ep.status = 'Active')::int AS active_employees,
         COUNT(*) FILTER (WHERE ep.status = 'Inactive')::int AS inactive_employees,
         COUNT(*) FILTER (WHERE ep.status = 'On Leave')::int AS on_leave,
         COUNT(*)::int AS total_employees
       FROM employee_profiles ep
       WHERE ep.company_id = $1`,
      [companyId]
    ),
    // Today's attendance
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Present')::int AS present_today,
         COUNT(*) FILTER (WHERE status = 'Absent')::int AS absent_today,
         COUNT(*) FILTER (WHERE status = 'Leave')::int AS on_leave_today,
         COUNT(*) FILTER (WHERE status = 'Holiday')::int AS holiday_today,
         COUNT(*) FILTER (WHERE status = 'Half-Day')::int AS half_day_today,
         COUNT(*)::int AS total_records
       FROM attendance
       WHERE company_id = $1 AND date = CURRENT_DATE`,
      [companyId]
    ),
    // Pending leave requests
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending_leaves,
         COUNT(*) FILTER (WHERE status = 'Approved')::int AS approved_leaves,
         COUNT(*) FILTER (WHERE status = 'Rejected')::int AS rejected_leaves
       FROM leave_requests
       WHERE company_id = $1
         AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [companyId]
    ),
    // Latest payroll run
    query(
      `SELECT
         COUNT(*)::int AS total_processed,
         COALESCE(SUM(net_salary), 0)::decimal AS total_payout,
         MAX(month) AS last_month,
         MAX(year) AS last_year
       FROM payroll
       WHERE company_id = $1 AND status IN ('Processed', 'Approved', 'Paid')
         AND year = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [companyId]
    ),
  ]);

  return {
    employees: employees.rows[0],
    todayAttendance: attendance.rows[0],
    monthlyLeaves: leaves.rows[0],
    payrollSummary: payroll.rows[0],
  };
};

const getDepartmentBreakdown = async (companyId) => {
  const result = await query(
    `SELECT department, COUNT(*)::int AS count
     FROM employee_profiles
     WHERE company_id = $1 AND status = 'Active' AND department IS NOT NULL
     GROUP BY department
     ORDER BY count DESC`,
    [companyId]
  );
  return result.rows;
};

const getRecentActivity = async (companyId, limit = 20) => {
  const result = await query(
    `SELECT al.*, u.first_name, u.last_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.company_id = $1
     ORDER BY al.timestamp DESC
     LIMIT $2`,
    [companyId, limit]
  );
  return result.rows;
};

module.exports = { getDashboardStats, getDepartmentBreakdown, getRecentActivity };
