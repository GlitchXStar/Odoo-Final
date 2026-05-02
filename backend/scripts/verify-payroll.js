require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function verifyPayroll() {
  const client = await pool.connect();
  try {
    console.log('\n===== PAYROLL TABLE (latest per employee) =====');
    const payrollRes = await client.query(`
      SELECT DISTINCT ON (p.user_id)
        p.user_id, u.first_name, u.last_name,
        p.month, p.year,
        p.basic, p.hra, p.allowances, p.bonus, p.gross_salary,
        p.pf_deduction, p.esi_deduction, p.professional_tax, p.income_tax,
        p.total_deductions, p.net_salary, p.status
      FROM payroll p
      INNER JOIN users u ON p.user_id = u.id
      ORDER BY p.user_id, p.year DESC, p.month DESC
    `);

    if (payrollRes.rows.length === 0) {
      console.log('No payroll records found.');
    } else {
      payrollRes.rows.forEach((r) => {
        const gross = Number(r.basic) + Number(r.hra) + Number(r.allowances) + Number(r.bonus);
        console.log(`\n--- ${r.first_name} ${r.last_name} (user_id: ${r.user_id}) [${r.month}/${r.year}] ---`);
        console.log(`  Basic:             ₹${Number(r.basic).toLocaleString()}`);
        console.log(`  HRA:               ₹${Number(r.hra).toLocaleString()}`);
        console.log(`  Allowances:        ₹${Number(r.allowances).toLocaleString()}`);
        console.log(`  Bonus:             ₹${Number(r.bonus).toLocaleString()}`);
        console.log(`  Component Gross:   ₹${gross.toLocaleString()}`);
        console.log(`  Adjusted Gross:    ₹${Number(r.gross_salary).toLocaleString()} (after attendance)`);
        console.log(`  PF Deduction:      ₹${Number(r.pf_deduction).toLocaleString()}`);
        console.log(`  ESI Deduction:     ₹${Number(r.esi_deduction).toLocaleString()}`);
        console.log(`  Professional Tax:  ₹${Number(r.professional_tax).toLocaleString()}`);
        console.log(`  Income Tax (TDS):  ₹${Number(r.income_tax).toLocaleString()}`);
        console.log(`  Total Deductions:  ₹${Number(r.total_deductions).toLocaleString()}`);
        console.log(`  Net Salary:        ₹${Number(r.net_salary).toLocaleString()}`);
        console.log(`  Status:            ${r.status}`);
        const expectedNet = Number(r.gross_salary) - Number(r.total_deductions);
        const netMatch = Math.abs(expectedNet - Number(r.net_salary)) < 1;
        console.log(`  Net Check:         ${netMatch ? '✓ MATCH' : `✗ MISMATCH (expected ₹${expectedNet.toFixed(2)})`}`);
      });
    }

    console.log('\n===== ACTIVE SALARY STRUCTURES =====');
    const salRes = await client.query(`
      SELECT ss.user_id, u.first_name, u.last_name,
        ss.basic, ss.hra, ss.conveyance_allowance, ss.medical_allowance,
        ss.special_allowance, ss.bonus, ss.other_allowances, ss.gross_salary,
        ss.effective_from, ss.is_active
      FROM salary_structure ss
      INNER JOIN users u ON ss.user_id = u.id
      WHERE ss.is_active = true
      ORDER BY ss.user_id
    `);

    if (salRes.rows.length === 0) {
      console.log('No active salary structures found.');
    } else {
      salRes.rows.forEach((r) => {
        console.log(`\n--- ${r.first_name} ${r.last_name} (user_id: ${r.user_id}) ---`);
        console.log(`  Basic:             ₹${Number(r.basic).toLocaleString()}`);
        console.log(`  HRA:               ₹${Number(r.hra).toLocaleString()}`);
        console.log(`  Conveyance:        ₹${Number(r.conveyance_allowance).toLocaleString()}`);
        console.log(`  Medical:           ₹${Number(r.medical_allowance).toLocaleString()}`);
        console.log(`  Special:           ₹${Number(r.special_allowance).toLocaleString()}`);
        console.log(`  Bonus:             ₹${Number(r.bonus).toLocaleString()}`);
        console.log(`  Other:             ₹${Number(r.other_allowances).toLocaleString()}`);
        console.log(`  Gross (DB gen):    ₹${Number(r.gross_salary).toLocaleString()}`);
        console.log(`  Effective From:    ${r.effective_from?.toISOString().slice(0, 10)}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

verifyPayroll();
