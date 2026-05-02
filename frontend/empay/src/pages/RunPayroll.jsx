import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, CheckCircle, Users, DollarSign,
  AlertTriangle, ChevronDown
} from 'lucide-react';

const steps = [
  { key: 'review', label: 'Review Employees' },
  { key: 'calculate', label: 'Calculate Salary' },
  { key: 'confirm', label: 'Confirm & Process' },
];

const employeeSummary = [
  { dept: 'Engineering', count: 320, grossTotal: '₹18.2L' },
  { dept: 'Marketing', count: 180, grossTotal: '₹8.5L' },
  { dept: 'Sales', count: 250, grossTotal: '₹10.8L' },
  { dept: 'HR', count: 85, grossTotal: '₹4.2L' },
  { dept: 'Finance', count: 120, grossTotal: '₹6.1L' },
  { dept: 'Operations', count: 293, grossTotal: '₹4.5L' },
];

const totalEmployees = employeeSummary.reduce((sum, d) => sum + d.count, 0);

export default function RunPayroll() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [payMonth, setPayMonth] = useState('2026-05');

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 3000);
  };

  if (isComplete) {
    return (
      <div className="max-w-content mx-auto">
        <div className="bg-canvas border border-hairline rounded-lg p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-status-approved-bg flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-success" />
          </div>
          <h2 className="font-cal text-display-sm text-ink mb-2">Payroll Processed!</h2>
          <p className="text-body-sm text-muted mb-6">
            May 2026 payroll has been processed for {totalEmployees} employees.
            Payslips have been generated.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/app/payroll/payslips" className="btn-primary inline-flex items-center gap-2">
              View Payslips
            </Link>
            <Link to="/app/payroll" className="btn-secondary">
              Back to Payroll
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto">
      {/* Back */}
      <Link
        to="/app/payroll"
        className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to payroll
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">Run Payroll</h1>
        <p className="text-body-sm text-muted mt-1">
          Process monthly salary for all employees.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-caption font-medium transition-all ${
              i <= currentStep ? 'bg-ink text-on-primary' : 'bg-surface-card text-muted'
            }`}>
              {i < currentStep ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span className={`text-body-sm ${i <= currentStep ? 'text-ink font-medium' : 'text-muted'}`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-12 h-px ${i < currentStep ? 'bg-ink' : 'bg-hairline'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden mb-6">
        {currentStep === 0 && (
          <>
            <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
              <h3 className="text-title-sm text-ink">Employee Summary by Department</h3>
              <div className="flex items-center gap-2">
                <span className="text-caption text-muted">Pay Period:</span>
                <input
                  type="month"
                  value={payMonth}
                  onChange={(e) => setPayMonth(e.target.value)}
                  className="input-field py-1.5 w-auto text-body-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline bg-surface-soft">
                    <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
                    <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employees</th>
                    <th className="text-left px-5 py-3 text-caption text-muted font-medium">Gross Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {employeeSummary.map((dept) => (
                    <tr key={dept.dept} className="hover:bg-surface-soft/50 transition-colors">
                      <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{dept.dept}</td>
                      <td className="px-5 py-3.5 text-body-sm text-muted">{dept.count}</td>
                      <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{dept.grossTotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-hairline bg-surface-soft">
                    <td className="px-5 py-3 text-body-sm font-medium text-ink">Total</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-ink">{totalEmployees}</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-ink">₹52.3L</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <div className="p-6">
            <h3 className="text-title-sm text-ink mb-4">Salary Calculation Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Gross', value: '₹52,30,000', icon: DollarSign },
                { label: 'Total Deductions', value: '₹9,80,000', icon: AlertTriangle },
                { label: 'Net Payable', value: '₹42,50,000', icon: DollarSign },
              ].map((item) => (
                <div key={item.label} className="bg-surface-card rounded-lg p-5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-canvas flex items-center justify-center mx-auto mb-2">
                    <item.icon size={18} className="text-muted" />
                  </div>
                  <p className="text-caption text-muted">{item.label}</p>
                  <p className="text-title-lg text-ink mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-status-pending-bg border border-status-pending-text/10 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-ink">Review Required</p>
                <p className="text-caption text-muted">
                  Please verify the calculated amounts before proceeding to the final step.
                  Salary calculations include all allowances, deductions, PF, and tax.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-surface-card flex items-center justify-center mx-auto mb-4">
                <Play size={28} className="text-ink" />
              </div>
              <h3 className="text-title-lg text-ink mb-2">Ready to Process</h3>
              <p className="text-body-sm text-muted mb-6">
                You are about to process payroll for <span className="font-medium text-ink">{totalEmployees} employees</span> for{' '}
                <span className="font-medium text-ink">May 2026</span>. This will generate payslips and
                mark salaries for disbursement.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-surface-card rounded-lg p-3">
                  <p className="text-caption text-muted">Employees</p>
                  <p className="text-title-sm text-ink">{totalEmployees}</p>
                </div>
                <div className="bg-surface-card rounded-lg p-3">
                  <p className="text-caption text-muted">Net Payable</p>
                  <p className="text-title-sm text-ink">₹42.5L</p>
                </div>
                <div className="bg-surface-card rounded-lg p-3">
                  <p className="text-caption text-muted">Period</p>
                  <p className="text-title-sm text-ink">May 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          className="btn-secondary"
          disabled={currentStep === 0}
        >
          Previous
        </button>
        {currentStep < 2 ? (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            className="btn-primary inline-flex items-center gap-2"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="btn-primary inline-flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play size={16} />
                Process Payroll
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
