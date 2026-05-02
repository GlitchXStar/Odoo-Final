const { query, getClient } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');
const { INCOME_TAX_SLABS, PROFESSIONAL_TAX_SLABS } = require('../config/constants');

const runPayroll = async (companyId, { userId, month, year, generatedBy }) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Check if payroll already exists
    const existing = await client.query(
      'SELECT id FROM payroll WHERE user_id = $1 AND month = $2 AND year = $3',
      [userId, month, year]
    );
    if (existing.rows.length > 0) {
      throw new AppError(`Payroll already processed for ${month}/${year}.`, 409);
    }

    // 1. Fetch salary structure
    const salaryResult = await client.query(
      `SELECT * FROM salary_structure
       WHERE user_id = $1 AND company_id = $2 AND is_active = true
         AND effective_from <= $3
         AND (effective_to IS NULL OR effective_to >= $3)
       ORDER BY effective_from DESC LIMIT 1`,
      [userId, companyId, `${year}-${String(month).padStart(2, '0')}-01`]
    );

    if (salaryResult.rows.length === 0) {
      throw new AppError('No active salary structure found for this employee.', 404);
    }

    const salary = salaryResult.rows[0];

    // 2. Fetch attendance for the month
    const attendanceResult = await client.query(
      `SELECT status, COUNT(*)::int AS count,
              SUM(overtime_minutes)::int AS total_overtime
       FROM attendance
       WHERE user_id = $1 AND company_id = $2
         AND EXTRACT(MONTH FROM date) = $3
         AND EXTRACT(YEAR FROM date) = $4
       GROUP BY status`,
      [userId, companyId, month, year]
    );

    // 3. Calculate working days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(year, month - 1, d).getDay();
      if (dayOfWeek !== 0) workingDays++; // Exclude Sundays
    }

    // Parse attendance counts
    let presentDays = 0;
    let leaveDays = 0;
    let absentDays = 0;
    let halfDays = 0;
    let holidayDays = 0;
    let totalOvertimeMinutes = 0;

    for (const row of attendanceResult.rows) {
      switch (row.status) {
        case 'Present': presentDays = row.count; totalOvertimeMinutes += row.total_overtime || 0; break;
        case 'Leave': leaveDays = row.count; break;
        case 'Absent': absentDays = row.count; break;
        case 'Half-Day': halfDays = row.count; break;
        case 'Holiday': holidayDays = row.count; break;
      }
    }

    // Effective present days (half-days count as 0.5)
    const effectivePresentDays = presentDays + (halfDays * 0.5) + holidayDays;

    // 4. Fetch approved leaves that are unpaid for deduction
    const unpaidLeaves = await client.query(
      `SELECT COALESCE(SUM(lr.total_days), 0)::decimal AS unpaid_days
       FROM leave_requests lr
       INNER JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.user_id = $1 AND lr.company_id = $2
         AND lr.status = 'Approved' AND lt.is_paid = false
         AND EXTRACT(MONTH FROM lr.start_date) = $3
         AND EXTRACT(YEAR FROM lr.start_date) = $4`,
      [userId, companyId, month, year]
    );

    const unpaidLeaveDays = parseFloat(unpaidLeaves.rows[0].unpaid_days) || 0;

    // 5. Calculate Gross Salary
    const basic = parseFloat(salary.basic);
    const hra = parseFloat(salary.hra);
    const allowances = parseFloat(salary.conveyance_allowance) +
                       parseFloat(salary.medical_allowance) +
                       parseFloat(salary.special_allowance) +
                       parseFloat(salary.other_allowances);
    const bonus = parseFloat(salary.bonus);
    const grossSalary = basic + hra + allowances + bonus;

    // Pro-rate based on working days
    const perDaySalary = grossSalary / workingDays;
    const leaveDeduction = unpaidLeaveDays * perDaySalary;
    const absentDeduction = absentDays * perDaySalary;
    const totalSalaryDeduction = leaveDeduction + absentDeduction;

    const adjustedGross = grossSalary - totalSalaryDeduction;

    // 6. Calculate Deductions

    // PF = 12% of Basic (capped at basic of 15000)
    const pfBasic = Math.min(basic, 15000);
    const pfDeduction = Math.round((pfBasic * 12) / 100);

    // ESI = 0.75% of gross if gross <= 21000
    let esiDeduction = 0;
    if (adjustedGross <= 21000) {
      esiDeduction = Math.round((adjustedGross * 0.75) / 100);
    }

    // Professional Tax
    const professionalTax = calculateProfessionalTax(adjustedGross);

    // Income Tax (annual slab → monthly)
    const incomeTax = calculateMonthlyIncomeTax(grossSalary * 12);

    // TDS
    const tds = 0; // Simplified: TDS equals income tax for now

    const totalDeductions = pfDeduction + esiDeduction + professionalTax + incomeTax + tds;

    // 7. Compute Net Salary
    const netSalary = Math.round((adjustedGross - totalDeductions) * 100) / 100;

    // Overtime calculation (simple: 1.5x hourly rate)
    const overtimeHours = totalOvertimeMinutes / 60;
    const hourlyRate = grossSalary / (workingDays * 8);
    const overtimeAmount = Math.round(overtimeHours * hourlyRate * 1.5 * 100) / 100;

    const finalNet = Math.round((netSalary + overtimeAmount) * 100) / 100;

    // 8. Store in payroll table
    const payrollResult = await client.query(
      `INSERT INTO payroll
        (user_id, company_id, month, year, salary_structure_id,
         basic, hra, allowances, bonus, gross_salary,
         pf_deduction, esi_deduction, professional_tax, income_tax, tds, other_deductions,
         total_deductions, net_salary,
         working_days, present_days, leave_days, absent_days,
         overtime_hours, overtime_amount,
         status, generated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
       RETURNING *`,
      [userId, companyId, month, year, salary.id,
       basic, hra, allowances, bonus, adjustedGross,
       pfDeduction, esiDeduction, professionalTax, incomeTax, tds, 0,
       totalDeductions, finalNet,
       workingDays, effectivePresentDays, leaveDays, absentDays,
       Math.round(overtimeHours * 100) / 100, overtimeAmount,
       'Processed', generatedBy]
    );

    await client.query('COMMIT');

    return payrollResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const runBulkPayroll = async (companyId, { month, year, generatedBy }) => {
  // Get all active employees in the company
  const employees = await query(
    `SELECT u.id FROM users u
     INNER JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE u.company_id = $1 AND u.is_active = true AND ep.status = 'Active'`,
    [companyId]
  );

  const results = [];
  const errors = [];

  for (const emp of employees.rows) {
    try {
      const payroll = await runPayroll(companyId, { userId: emp.id, month, year, generatedBy });
      results.push(payroll);
    } catch (err) {
      errors.push({ userId: emp.id, error: err.message });
    }
  }

  return { processed: results.length, failed: errors.length, results, errors };
};

const getPayrollByUser = async (companyId, userId, { month, year }) => {
  let sql = 'SELECT * FROM payroll WHERE company_id = $1 AND user_id = $2';
  const params = [companyId, userId];
  let idx = 3;

  if (month) {
    sql += ` AND month = $${idx++}`;
    params.push(month);
  }
  if (year) {
    sql += ` AND year = $${idx++}`;
    params.push(year);
  }

  sql += ' ORDER BY year DESC, month DESC';
  const result = await query(sql, params);
  return result.rows;
};

function calculateProfessionalTax(monthlySalary) {
  for (const slab of PROFESSIONAL_TAX_SLABS) {
    if (monthlySalary >= slab.min && monthlySalary <= slab.max) {
      return slab.amount;
    }
  }
  return 200; // default max
}

function calculateMonthlyIncomeTax(annualSalary) {
  let tax = 0;
  let remaining = annualSalary;

  for (const slab of INCOME_TAX_SLABS) {
    if (remaining <= 0) break;

    const slabRange = slab.max === Infinity ? remaining : Math.min(remaining, slab.max - slab.min + 1);
    tax += (slabRange * slab.rate) / 100;
    remaining -= slabRange;
  }

  // Monthly tax
  return Math.round((tax / 12) * 100) / 100;
}

module.exports = { runPayroll, runBulkPayroll, getPayrollByUser };
