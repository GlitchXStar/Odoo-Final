const { query } = require('../config/db');
const { AppError } = require('../middleware/errorHandler.middleware');

const getPayslip = async (payrollId, companyId) => {
  // Get payroll data with user info
  const result = await query(
    `SELECT p.*, u.first_name, u.last_name, u.email,
            ep.employee_code, ep.department, ep.designation,
            ep.bank_account_number, ep.bank_name, ep.bank_ifsc,
            c.name AS company_name, c.address AS company_address
     FROM payroll p
     INNER JOIN users u ON p.user_id = u.id
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     INNER JOIN companies c ON p.company_id = c.id
     WHERE p.id = $1 AND p.company_id = $2`,
    [payrollId, companyId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Payroll record not found.', 404);
  }

  const payroll = result.rows[0];

  // Build payslip JSON
  const payslip = {
    payrollId: payroll.id,
    month: payroll.month,
    year: payroll.year,
    status: payroll.status,
    company: {
      name: payroll.company_name,
      address: payroll.company_address,
    },
    employee: {
      name: `${payroll.first_name} ${payroll.last_name}`,
      email: payroll.email,
      employeeCode: payroll.employee_code,
      department: payroll.department,
      designation: payroll.designation,
      bankAccount: payroll.bank_account_number,
      bankName: payroll.bank_name,
      bankIfsc: payroll.bank_ifsc,
    },
    earnings: {
      basic: parseFloat(payroll.basic),
      hra: parseFloat(payroll.hra),
      allowances: parseFloat(payroll.allowances),
      bonus: parseFloat(payroll.bonus),
      overtimeAmount: parseFloat(payroll.overtime_amount),
      grossSalary: parseFloat(payroll.gross_salary),
    },
    deductions: {
      pf: parseFloat(payroll.pf_deduction),
      esi: parseFloat(payroll.esi_deduction),
      professionalTax: parseFloat(payroll.professional_tax),
      incomeTax: parseFloat(payroll.income_tax),
      tds: parseFloat(payroll.tds),
      otherDeductions: parseFloat(payroll.other_deductions),
      totalDeductions: parseFloat(payroll.total_deductions),
    },
    attendance: {
      workingDays: payroll.working_days,
      presentDays: parseFloat(payroll.present_days),
      leaveDays: parseFloat(payroll.leave_days),
      absentDays: parseFloat(payroll.absent_days),
      overtimeHours: parseFloat(payroll.overtime_hours),
    },
    netSalary: parseFloat(payroll.net_salary),
    paymentDate: payroll.payment_date,
    paymentMode: payroll.payment_mode,
  };

  // Check/create payslip record
  const existingSlip = await query(
    'SELECT * FROM payslips WHERE payroll_id = $1',
    [payrollId]
  );

  if (existingSlip.rows.length === 0) {
    await query(
      `INSERT INTO payslips (payroll_id, user_id, company_id, file_name)
       VALUES ($1, $2, $3, $4)`,
      [payrollId, payroll.user_id, companyId, `payslip_${payroll.employee_code}_${payroll.month}_${payroll.year}.json`]
    );
  }

  return payslip;
};

const generatePayslipPDF = async (payrollId, companyId) => {
  const payslip = await getPayslip(payrollId, companyId);

  // Use PDFKit to generate PDF
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'payslips');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `payslip_${payslip.employee.employeeCode}_${payslip.month}_${payslip.year}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text(payslip.company.name, { align: 'center' });
    doc.fontSize(10).text(payslip.company.address || '', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Payslip - ${getMonthName(payslip.month)} ${payslip.year}`, { align: 'center' });
    doc.moveDown();

    // Employee Info
    doc.fontSize(10);
    doc.text(`Employee: ${payslip.employee.name}`);
    doc.text(`Code: ${payslip.employee.employeeCode}`);
    doc.text(`Department: ${payslip.employee.department || 'N/A'}`);
    doc.text(`Designation: ${payslip.employee.designation || 'N/A'}`);
    doc.moveDown();

    // Earnings
    doc.fontSize(12).text('Earnings', { underline: true });
    doc.fontSize(10);
    doc.text(`Basic: ₹${payslip.earnings.basic.toFixed(2)}`);
    doc.text(`HRA: ₹${payslip.earnings.hra.toFixed(2)}`);
    doc.text(`Allowances: ₹${payslip.earnings.allowances.toFixed(2)}`);
    doc.text(`Bonus: ₹${payslip.earnings.bonus.toFixed(2)}`);
    doc.text(`Overtime: ₹${payslip.earnings.overtimeAmount.toFixed(2)}`);
    doc.text(`Gross Salary: ₹${payslip.earnings.grossSalary.toFixed(2)}`, { bold: true });
    doc.moveDown();

    // Deductions
    doc.fontSize(12).text('Deductions', { underline: true });
    doc.fontSize(10);
    doc.text(`PF: ₹${payslip.deductions.pf.toFixed(2)}`);
    doc.text(`ESI: ₹${payslip.deductions.esi.toFixed(2)}`);
    doc.text(`Professional Tax: ₹${payslip.deductions.professionalTax.toFixed(2)}`);
    doc.text(`Income Tax: ₹${payslip.deductions.incomeTax.toFixed(2)}`);
    doc.text(`Total Deductions: ₹${payslip.deductions.totalDeductions.toFixed(2)}`, { bold: true });
    doc.moveDown();

    // Attendance
    doc.fontSize(12).text('Attendance', { underline: true });
    doc.fontSize(10);
    doc.text(`Working Days: ${payslip.attendance.workingDays}`);
    doc.text(`Present Days: ${payslip.attendance.presentDays}`);
    doc.text(`Leave Days: ${payslip.attendance.leaveDays}`);
    doc.text(`Absent Days: ${payslip.attendance.absentDays}`);
    doc.moveDown();

    // Net Salary
    doc.fontSize(14).text(`Net Salary: ₹${payslip.netSalary.toFixed(2)}`, { align: 'center' });

    doc.end();

    stream.on('finish', async () => {
      const stats = fs.statSync(filePath);
      // Update payslip record with file info
      await query(
        `UPDATE payslips SET file_url = $1, file_name = $2, file_size = $3
         WHERE payroll_id = $4`,
        [filePath, fileName, stats.size, payrollId]
      );

      resolve({ filePath, fileName, fileSize: stats.size, payslip });
    });

    stream.on('error', reject);
  });
};

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}

module.exports = { getPayslip, generatePayslipPDF };
