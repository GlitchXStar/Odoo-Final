import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Building2, Calendar, User } from 'lucide-react';
import { payroll as payrollApi } from '../services/api.js';

export default function PayslipDetail() {
  const { payslipId } = useParams();
  const [ps, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (payslipId) {
      fetchPayslip(payslipId);
    }
  }, [payslipId]);

  const fetchPayslip = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      const rows = json?.data ?? [];
      const raw = rows.find((r) => String(r.id) === String(id));
      if (!raw) { setError('Payslip not found.'); return; }

      // Transform raw payroll row into display shape
      const earnings = [
        { label: 'Basic Salary', amount: Number(raw.basic) },
        { label: 'HRA', amount: Number(raw.hra) },
        { label: 'Allowances', amount: Number(raw.allowances) },
        { label: 'Bonus', amount: Number(raw.bonus) },
      ].filter((e) => e.amount > 0);

      const deductions = [
        { label: 'Provident Fund', amount: Number(raw.pf_deduction) },
        { label: 'ESI', amount: Number(raw.esi_deduction) },
        { label: 'Professional Tax', amount: Number(raw.professional_tax) },
        { label: 'Income Tax (TDS)', amount: Number(raw.income_tax) },
        { label: 'Other Deductions', amount: Number(raw.other_deductions) },
      ].filter((d) => d.amount > 0);

      const grossEarnings = earnings.reduce((s, e) => s + e.amount, 0);
      const monthLabel = new Date(raw.year, raw.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

      setPayslip({
        ...raw,
        earnings,
        deductions,
        grossEarnings,
        totalDeductions: Number(raw.total_deductions),
        netPay: Number(raw.net_salary),
        month: monthLabel,
        employee: {
          name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
          empId: raw.employee_code || raw.login_id || `EMP-${raw.user_id}`,
          department: raw.department || '—',
          designation: raw.designation || '—',
          bankName: raw.bank_name || '—',
          accountNumber: raw.bank_account_number || '—',
          bankIfsc: raw.bank_ifsc || '—',
          panNumber: raw.pan_number || '—',
        },
        attendance: {
          workingDays: raw.working_days || '—',
          presentDays: raw.present_days || '—',
          leaveDays: raw.leave_days || 0,
          absentDays: raw.absent_days || 0,
          halfDays: raw.half_days || 0,
          overtimeHours: Number(raw.overtime_hours || 0).toFixed(1),
          overtimeAmount: Number(raw.overtime_amount || 0),
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to load payslip');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-content mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-content mx-auto">
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
          {error}
        </div>
      </div>
    );
  }

  if (!ps) return null;

  return (
    <div className="max-w-content mx-auto">
      {/* Back + Actions — hidden on print */}
      <div className="no-print">
        <Link
          to="/app/payroll/payslips"
          className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to payslips
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-cal text-display-md text-ink">Payslip</h1>
            <p className="text-body-sm text-muted mt-1">{ps.id} · {ps.month}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="btn-secondary inline-flex items-center gap-2">
              <Printer size={16} />
              Print
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary inline-flex items-center gap-2">
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Payslip Card — printable area */}
      <div id="payslip-printable" className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        {/* Company Header */}
        <div className="px-8 py-6 border-b-4 border-ink bg-canvas">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cal text-display-sm text-ink">EmPay</h2>
              <p className="text-body-sm text-muted mt-1">Smart HR Management System</p>
            </div>
            <div className="text-right">
              <p className="text-title-sm font-semibold text-ink">Salary Slip</p>
              <p className="text-caption text-muted mt-0.5">{ps.month}</p>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 py-5 border-b border-hairline bg-surface-soft/30">
          <div>
            <p className="text-caption text-muted">Employee Name</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.name}</p>
          </div>
          <div>
            <p className="text-caption text-muted">Employee ID</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.empId}</p>
          </div>
          <div>
            <p className="text-caption text-muted">Department</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.department}</p>
          </div>
          <div>
            <p className="text-caption text-muted">Designation</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.designation}</p>
          </div>
          <div>
            <p className="text-caption text-muted">Bank Name</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.bankName}</p>
          </div>
          <div>
            <p className="text-caption text-muted">Account No.</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.accountNumber}</p>
          </div>
          <div>
            <p className="text-caption text-muted">IFSC Code</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.bankIfsc}</p>
          </div>
          <div>
            <p className="text-caption text-muted">PAN Number</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.panNumber}</p>
          </div>
          <div>
            <p className="text-caption text-muted">Pay Period</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.month}</p>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 divide-x divide-hairline border-b border-hairline">
          {[
            { label: 'Working Days', value: ps.attendance.workingDays },
            { label: 'Present Days', value: ps.attendance.presentDays },
            { label: 'Leave Days', value: ps.attendance.leaveDays },
            { label: 'Absent Days', value: ps.attendance.absentDays },
            { label: 'Half Days', value: ps.attendance.halfDays },
            { label: 'Overtime Hrs', value: ps.attendance.overtimeHours },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3 text-center">
              <p className="text-caption text-muted">{item.label}</p>
              <p className="text-body-sm font-medium text-ink mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline">
          {/* Earnings */}
          <div className="p-8">
            <h3 className="text-title-sm text-ink mb-4">Earnings</h3>
            <div className="space-y-3">
              {ps.earnings.map((item) => (
                <div key={item.label} className="flex justify-between text-body-sm">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-ink font-medium">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-body-sm font-medium text-ink border-t border-hairline pt-3 mt-4">
              <span>Gross Earnings</span>
              <span>₹{ps.grossEarnings.toLocaleString()}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="p-8">
            <h3 className="text-title-sm text-ink mb-4">Deductions</h3>
            <div className="space-y-3">
              {ps.deductions.map((item) => (
                <div key={item.label} className="flex justify-between text-body-sm">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-error font-medium">-₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-body-sm font-medium text-error border-t border-hairline pt-3 mt-4">
              <span>Total Deductions</span>
              <span>-₹{ps.totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="px-8 py-5 bg-surface-card border-t border-hairline">
          <div className="flex items-center justify-between">
            <span className="text-title-sm text-ink">Net Pay (Take Home)</span>
            <span className="font-cal text-display-sm text-ink">₹{ps.netPay.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
