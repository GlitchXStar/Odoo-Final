import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Building2, Calendar, User } from 'lucide-react';

const payslipData = {
  id: 'PS-2026-04-001',
  month: 'April 2026',
  employee: {
    name: 'Priya Sharma',
    empId: 'EMP-001',
    designation: 'Senior Developer',
    department: 'Engineering',
    bankName: 'HDFC Bank',
    accountNumber: 'XXXX XXXX 4521',
    panNumber: 'ABCPS1234K',
  },
  earnings: [
    { label: 'Basic Salary', amount: 35000 },
    { label: 'House Rent Allowance', amount: 14000 },
    { label: 'Dearness Allowance', amount: 3500 },
    { label: 'Conveyance Allowance', amount: 1600 },
    { label: 'Medical Allowance', amount: 1250 },
    { label: 'Special Allowance', amount: 2250 },
  ],
  deductions: [
    { label: 'Provident Fund (PF)', amount: 4200 },
    { label: 'Professional Tax', amount: 200 },
    { label: 'Income Tax (TDS)', amount: 2600 },
  ],
  grossEarnings: 57600,
  totalDeductions: 7000,
  netPay: 50600,
};

export default function PayslipDetail() {
  const { payslipId } = useParams();
  const ps = payslipData;

  return (
    <div className="max-w-content mx-auto">
      {/* Back */}
      <Link
        to="/app/payroll/payslips"
        className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to payslips
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Payslip</h1>
          <p className="text-body-sm text-muted mt-1">
            {ps.id} · {ps.month}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary inline-flex items-center gap-2">
            <Printer size={16} />
            Print
          </button>
          <button className="btn-primary inline-flex items-center gap-2">
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Payslip Card */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        {/* Company Header */}
        <div className="px-8 py-6 bg-ink text-on-primary">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cal text-display-sm">EmPay</h2>
              <p className="text-body-sm text-white/60 mt-1">Smart HR Management System</p>
            </div>
            <div className="text-right">
              <p className="text-body-sm font-medium">Salary Slip</p>
              <p className="text-caption text-white/60">{ps.month}</p>
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
            <p className="text-caption text-muted">PAN Number</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.employee.panNumber}</p>
          </div>
          <div>
            <p className="text-caption text-muted">Pay Period</p>
            <p className="text-body-sm font-medium text-ink mt-0.5">{ps.month}</p>
          </div>
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
