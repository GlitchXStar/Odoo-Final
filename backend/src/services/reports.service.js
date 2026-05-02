const { query } = require('../config/db');

const getReportSummary = async (companyId, month, year) => {
  const [employees, attendance, leaves, payroll] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total_employees
       FROM employee_profiles
       WHERE company_id = $1 AND status = 'Active'`,
      [companyId]
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('Present','Half-Day'))::float AS present_count,
         COUNT(*) FILTER (WHERE status NOT IN ('Holiday','Leave'))::float AS working_records
       FROM attendance
       WHERE company_id = $1
         AND EXTRACT(MONTH FROM date) = $2
         AND EXTRACT(YEAR FROM date) = $3`,
      [companyId, month, year]
    ),
    query(
      `SELECT COUNT(*)::int AS total_leaves
       FROM leave_requests
       WHERE company_id = $1
         AND status IN ('Pending','Approved')
         AND EXTRACT(MONTH FROM start_date) = $2
         AND EXTRACT(YEAR FROM start_date) = $3`,
      [companyId, month, year]
    ),
    query(
      `SELECT COALESCE(SUM(net_salary), 0)::decimal AS total_payroll
       FROM payroll
       WHERE company_id = $1 AND month = $2 AND year = $3
         AND status IN ('Processed','Approved','Paid')`,
      [companyId, month, year]
    ),
  ]);

  const presentCount = parseFloat(attendance.rows[0].present_count) || 0;
  const workingRecords = parseFloat(attendance.rows[0].working_records) || 0;
  const attendancePct = workingRecords > 0 ? Math.round((presentCount / workingRecords) * 100) : 0;

  return {
    totalEmployees: employees.rows[0].total_employees,
    avgAttendance: attendancePct,
    leaveRequests: leaves.rows[0].total_leaves,
    payrollCost: parseFloat(payroll.rows[0].total_payroll),
  };
};

const getDepartmentReport = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       ep.department AS dept,
       COUNT(DISTINCT ep.user_id)::int AS headcount,
       COALESCE(
         ROUND(
           COUNT(a.id) FILTER (WHERE a.status IN ('Present','Half-Day'))::numeric
           / NULLIF(COUNT(a.id) FILTER (WHERE a.status NOT IN ('Holiday','Leave')), 0) * 100
         ), 0
       )::int AS attendance,
       COALESCE(
         ROUND(
           COUNT(lr.id)::numeric
           / NULLIF(COUNT(DISTINCT ep.user_id), 0) * 10
         ), 0
       )::int AS leave_rate,
       COALESCE(
         AVG(ss.basic + ss.hra + ss.conveyance_allowance + ss.medical_allowance + ss.special_allowance + ss.other_allowances + ss.bonus), 0
       )::int AS avg_salary
     FROM employee_profiles ep
     LEFT JOIN attendance a
       ON ep.user_id = a.user_id
       AND EXTRACT(MONTH FROM a.date) = $2
       AND EXTRACT(YEAR FROM a.date) = $3
     LEFT JOIN leave_requests lr
       ON ep.user_id = lr.user_id
       AND lr.status IN ('Pending','Approved')
       AND EXTRACT(MONTH FROM lr.start_date) = $2
       AND EXTRACT(YEAR FROM lr.start_date) = $3
     LEFT JOIN salary_structure ss
       ON ep.user_id = ss.user_id AND ss.is_active = true
     WHERE ep.company_id = $1 AND ep.status = 'Active' AND ep.department IS NOT NULL
     GROUP BY ep.department
     ORDER BY headcount DESC`,
    [companyId, month, year]
  );
  return result.rows;
};

const getMonthlyTrend = async (companyId, year) => {
  const result = await query(
    `WITH months AS (
       SELECT generate_series(1, 12) AS month_num
     )
     SELECT
       m.month_num,
       TO_CHAR(TO_DATE(m.month_num::text, 'MM'), 'Mon') AS month,
       COALESCE(
         (SELECT COUNT(DISTINCT ep.user_id)::int
          FROM employee_profiles ep
          WHERE ep.company_id = $1 AND ep.status = 'Active'), 0
       ) AS employees,
       COALESCE(
         (SELECT ROUND(SUM(p.net_salary) / 100000.0, 2)::decimal
          FROM payroll p
          WHERE p.company_id = $1 AND p.month = m.month_num AND p.year = $2
            AND p.status IN ('Processed','Approved','Paid')), 0
       ) AS payroll,
       COALESCE(
         (SELECT ROUND(
           COUNT(*) FILTER (WHERE a.status IN ('Present','Half-Day'))::numeric
           / NULLIF(COUNT(*) FILTER (WHERE a.status NOT IN ('Holiday','Leave')), 0) * 100
         )::int
          FROM attendance a
          WHERE a.company_id = $1
            AND EXTRACT(MONTH FROM a.date) = m.month_num
            AND EXTRACT(YEAR FROM a.date) = $2), 0
       ) AS attendance
     FROM months m
     WHERE m.month_num <= EXTRACT(MONTH FROM CURRENT_DATE)
       OR $2 < EXTRACT(YEAR FROM CURRENT_DATE)
     ORDER BY m.month_num`,
    [companyId, year]
  );
  return result.rows;
};

const getLeaveDistribution = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       lt.name AS type,
       COUNT(lr.id)::int AS count
     FROM leave_types lt
     LEFT JOIN leave_requests lr
       ON lr.leave_type_id = lt.id
       AND lr.company_id = $1
       AND lr.status IN ('Pending','Approved')
       AND EXTRACT(MONTH FROM lr.start_date) = $2
       AND EXTRACT(YEAR FROM lr.start_date) = $3
     WHERE lt.company_id = $1
     GROUP BY lt.name
     ORDER BY count DESC`,
    [companyId, month, year]
  );

  const rows = result.rows;
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return rows.map((r) => ({
    type: r.type,
    count: r.count,
    percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
  }));
};

const getHeadcountReport = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       ep.department,
       ep.designation,
       ep.status,
       COUNT(*)::int AS count,
       COUNT(*) FILTER (WHERE u.created_at >= DATE_TRUNC('month', MAKE_DATE($3, $2, 1))
         AND u.created_at < DATE_TRUNC('month', MAKE_DATE($3, $2, 1)) + INTERVAL '1 month')::int AS new_hires
     FROM employee_profiles ep
     INNER JOIN users u ON ep.user_id = u.id
     WHERE ep.company_id = $1
     GROUP BY ep.department, ep.designation, ep.status
     ORDER BY ep.department, ep.designation`,
    [companyId, month, year]
  );
  return result.rows;
};

const getAttendanceReport = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       u.first_name || ' ' || u.last_name AS employee_name,
       ep.department,
       ep.employee_code,
       COUNT(*) FILTER (WHERE a.status = 'Present')::int AS present,
       COUNT(*) FILTER (WHERE a.status = 'Absent')::int AS absent,
       COUNT(*) FILTER (WHERE a.status = 'Half-Day')::int AS half_day,
       COUNT(*) FILTER (WHERE a.status = 'Leave')::int AS on_leave,
       COUNT(*) FILTER (WHERE a.status = 'Holiday')::int AS holiday,
       COUNT(*) FILTER (WHERE a.late_minutes > 0)::int AS late_arrivals,
       COALESCE(ROUND(AVG(a.work_hours)::numeric, 2), 0) AS avg_work_hours,
       COALESCE(
         ROUND(
           COUNT(*) FILTER (WHERE a.status IN ('Present','Half-Day'))::numeric
           / NULLIF(COUNT(*) FILTER (WHERE a.status NOT IN ('Holiday','Leave')), 0) * 100
         ), 0
       )::int AS attendance_pct
     FROM attendance a
     INNER JOIN users u ON a.user_id = u.id
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE a.company_id = $1
       AND EXTRACT(MONTH FROM a.date) = $2
       AND EXTRACT(YEAR FROM a.date) = $3
     GROUP BY u.id, u.first_name, u.last_name, ep.department, ep.employee_code
     ORDER BY ep.department, employee_name`,
    [companyId, month, year]
  );
  return result.rows;
};

const getLeaveReport = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       u.first_name || ' ' || u.last_name AS employee_name,
       ep.department,
       lt.name AS leave_type,
       lr.start_date,
       lr.end_date,
       lr.total_days,
       lr.status,
       lr.reason
     FROM leave_requests lr
     INNER JOIN users u ON lr.user_id = u.id
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
     WHERE lr.company_id = $1
       AND EXTRACT(MONTH FROM lr.start_date) = $2
       AND EXTRACT(YEAR FROM lr.start_date) = $3
     ORDER BY lr.start_date DESC`,
    [companyId, month, year]
  );
  return result.rows;
};

const getPayrollReport = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       u.first_name || ' ' || u.last_name AS employee_name,
       ep.department,
       ep.designation,
       ep.employee_code,
       p.basic,
       p.hra,
       p.allowances,
       p.bonus,
       p.gross_salary,
       p.pf_deduction,
       p.esi_deduction,
       p.professional_tax,
       p.income_tax,
       p.total_deductions,
       p.net_salary,
       p.present_days,
       p.working_days,
       p.status
     FROM payroll p
     INNER JOIN users u ON p.user_id = u.id
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE p.company_id = $1 AND p.month = $2 AND p.year = $3
     ORDER BY ep.department, employee_name`,
    [companyId, month, year]
  );
  return result.rows;
};

const getAttritionReport = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       ep.department,
       COUNT(*) FILTER (WHERE ep.status = 'Active')::int AS active,
       COUNT(*) FILTER (WHERE ep.status = 'Inactive')::int AS inactive,
       COUNT(*) FILTER (WHERE ep.status = 'On Leave')::int AS on_leave,
       COUNT(*)::int AS total,
       COALESCE(
         ROUND(
           COUNT(*) FILTER (WHERE ep.status = 'Inactive')::numeric
           / NULLIF(COUNT(*), 0) * 100, 1
         ), 0
       ) AS attrition_rate
     FROM employee_profiles ep
     WHERE ep.company_id = $1
     GROUP BY ep.department
     ORDER BY attrition_rate DESC`,
    [companyId]
  );
  return result.rows;
};

const getComplianceReport = async (companyId, month, year) => {
  const result = await query(
    `SELECT
       u.first_name || ' ' || u.last_name AS employee_name,
       ep.department,
       ep.pan_number,
       p.pf_deduction,
       p.esi_deduction,
       p.professional_tax,
       p.income_tax,
       p.tds,
       p.gross_salary,
       p.net_salary,
       CASE WHEN ep.pan_number IS NOT NULL AND ep.pan_number != '' THEN true ELSE false END AS pan_verified,
       CASE WHEN ep.bank_account_number IS NOT NULL AND ep.bank_account_number != '' THEN true ELSE false END AS bank_verified
     FROM payroll p
     INNER JOIN users u ON p.user_id = u.id
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE p.company_id = $1 AND p.month = $2 AND p.year = $3
     ORDER BY ep.department, employee_name`,
    [companyId, month, year]
  );
  return result.rows;
};

module.exports = {
  getReportSummary,
  getDepartmentReport,
  getMonthlyTrend,
  getLeaveDistribution,
  getHeadcountReport,
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getAttritionReport,
  getComplianceReport,
};
