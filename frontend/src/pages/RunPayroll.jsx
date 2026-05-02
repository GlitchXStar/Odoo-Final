import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, CheckCircle, Users, IndianRupee,
  AlertTriangle, ChevronDown, Calendar, Download
} from 'lucide-react';

import { payroll, employees, salaryStructures } from '../services/api.js';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const steps = [
  { key: 'review', label: 'Review Employees' },
  { key: 'calculate', label: 'Calculate Salary' },
  { key: 'confirm', label: 'Confirm & Process' },
];

export default function RunPayroll() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [payMonth, setPayMonth] = useState('2026-05');
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [employeeDetail, setEmployeeDetail] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalGross, setTotalGross] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeSummary();
  }, []);

  const fetchEmployeeSummary = async () => {
    try {
      setLoading(true);
      const [empRes, salRes] = await Promise.all([
        employees.getAll(),
        salaryStructures.getAll().catch(() => ({ data: [] }))
      ]);
      const empList = empRes?.data?.employees ?? empRes?.data ?? empRes;
      const allEmployees = Array.isArray(empList) ? empList : [];
      const employeeArr = allEmployees.filter(emp => emp.status === 'Active');
      setSkippedCount(allEmployees.length - employeeArr.length);
      const salList = salRes?.data ?? salRes;
      const salArr = Array.isArray(salList) ? salList : [];

      // Build a map of user_id -> active salary structure gross
      const salMap = {};
      salArr.forEach((s) => { if (s.is_active) salMap[s.user_id] = s; });

      // Fetch backend estimates for all employees in parallel
      const estimateResults = await Promise.allSettled(
        employeeArr.map((emp) =>
          emp.user_id
            ? payroll.estimate(emp.user_id).then((r) => ({ userId: emp.user_id, data: r?.data || r }))
            : Promise.resolve({ userId: null, data: null })
        )
      );
      const estimateMap = {};
      estimateResults.forEach((r) => {
        if (r.status === 'fulfilled' && r.value?.userId) {
          estimateMap[r.value.userId] = r.value.data;
        }
      });

      // Group by department
      const byDept = employeeArr.reduce((acc, emp) => {
        const dept = emp.department || 'Other';
        if (!acc[dept]) acc[dept] = { count: 0, grossTotal: 0 };
        acc[dept].count++;
        acc[dept].grossTotal += Number(estimateMap[emp.user_id]?.gross_salary || salMap[emp.user_id]?.gross_salary) || 0;
        return acc;
      }, {});

      let sumGross = 0, sumDeduct = 0;
      const summary = Object.entries(byDept).map(([dept, data]) => {
        sumGross += data.grossTotal;
        return { dept, count: data.count, grossTotal: data.grossTotal };
      });
      employeeArr.forEach((emp) => {
        sumDeduct += Number(estimateMap[emp.user_id]?.total_deductions) || 0;
      });

      // Build per-employee detail rows (fall back to salMap when estimate is unavailable)
      const detail = employeeArr.map((emp) => {
        const est = estimateMap[emp.user_id] || {};
        const sal = salMap[emp.user_id] || {};
        const hasSalary = !!(est.gross_salary || sal.gross_salary);

        // Use estimate data if available, otherwise derive from salary structure
        const basic = Number(est.basic || sal.basic || 0);
        const hra = Number(est.hra || sal.hra || 0);
        const allowances = Number(est.allowances ||
          ((Number(sal.conveyance_allowance) || 0) + (Number(sal.medical_allowance) || 0) +
           (Number(sal.special_allowance) || 0) + (Number(sal.other_allowances) || 0)) || 0);
        const gross = Number(est.gross_salary || sal.gross_salary || 0);

        return {
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
          department: emp.department || '—',
          designation: emp.designation || '—',
          hasSalary,
          basic,
          hra,
          allowances,
          gross,
          pf: Number(est.pf_deduction || 0),
          esi: Number(est.esi_deduction || 0),
          pt: Number(est.professional_tax || 0),
          incomeTax: Number(est.income_tax || 0),
          totalDeductions: Number(est.total_deductions || 0),
          net: Number(est.net_salary || 0),
        };
      });

      setEmployeeSummary(summary);
      setEmployeeDetail(detail);
      setTotalEmployees(employeeArr.length);
      setTotalGross(sumGross);
      setTotalDeductions(sumDeduct);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await payroll.run({ month: payMonth });
      setIsComplete(true);
    } catch (err) {
      setError(err.message || 'Payroll processing failed');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-content mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-content mx-auto">
        <div className="bg-canvas border border-hairline rounded-lg p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-status-approved-bg flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-success" />
          </div>
          <h2 className="font-cal text-display-sm text-ink mb-2">Payroll Processed!</h2>
          <p className="text-body-sm text-muted mb-6">
            {payMonth} payroll has been processed for {totalEmployees} employees.
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
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted" />
                <span className="text-body-sm text-muted">Pay Period:</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={parseInt(payMonth.split('-')[1])}
                      onChange={(e) => {
                        const y = payMonth.split('-')[0];
                        setPayMonth(`${y}-${String(e.target.value).padStart(2, '0')}`);
                      }}
                      className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer min-w-[140px]"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={parseInt(payMonth.split('-')[0])}
                      onChange={(e) => {
                        const m = payMonth.split('-')[1];
                        setPayMonth(`${e.target.value}-${m}`);
                      }}
                      className="input-field py-2 pl-3 pr-8 text-body-sm font-medium appearance-none cursor-pointer min-w-[90px]"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </div>
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
                      <td className="px-5 py-3.5 text-body-sm font-medium text-ink">₹{(dept.grossTotal / 100000).toFixed(1)}L</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-hairline bg-surface-soft">
                    <td className="px-5 py-3 text-body-sm font-medium text-ink">Total</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-ink">{totalEmployees}</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-ink">₹{(totalGross / 100000).toFixed(1)}L</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {skippedCount > 0 && (
              <div className="px-6 py-3 bg-surface-soft border-t border-hairline flex items-center gap-2">
                <AlertTriangle size={14} className="text-muted" />
                <p className="text-caption text-muted">
                  {skippedCount} employee{skippedCount !== 1 ? 's' : ''} skipped (Inactive, On Leave, Terminated, or Resigned)
                </p>
              </div>
            )}
          </>
        )}

        {currentStep === 1 && (
          <div className="p-6">
            <h3 className="text-title-sm text-ink mb-4">Salary Calculation Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Gross', value: `₹${totalGross.toLocaleString('en-IN')}` },
                { label: 'Total Deductions', value: `₹${totalDeductions.toLocaleString('en-IN')}` },
                { label: 'Net Payable', value: `₹${(totalGross - totalDeductions).toLocaleString('en-IN')}` },
              ].map((item) => (
                <div key={item.label} className="bg-surface-card rounded-lg p-5 text-center">
                  <p className="text-caption text-muted">{item.label}</p>
                  <p className="text-title-lg text-ink mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Toggle detail */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-body-sm text-muted">Per-employee salary breakdown</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const rows = [['Employee','Department','Designation','Basic','HRA','Allowances','Gross','PF','ESI','PT','Tax','Total Deductions','Net']];
                    employeeDetail.forEach(emp => {
                      rows.push([emp.name, emp.department, emp.designation, emp.basic, emp.hra, emp.allowances, emp.gross, emp.pf, emp.esi, emp.pt, emp.incomeTax, emp.totalDeductions, emp.net]);
                    });
                    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `payroll-breakdown-${payMonth}.csv`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-body-sm text-muted hover:text-ink inline-flex items-center gap-1"
                >
                  <Download size={14} />
                  Export
                </button>
                <button
                  onClick={() => setShowDetail((v) => !v)}
                  className="text-body-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {showDetail ? 'Hide Details' : 'View Details'}
                  <ChevronDown size={14} className={`transition-transform ${showDetail ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {showDetail && (
              <div className="overflow-x-auto rounded-lg border border-hairline mb-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-soft border-b border-hairline">
                      <th className="px-4 py-2.5 text-caption text-muted font-medium">Employee</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium">Dept</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">Basic</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">HRA</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">Allowances</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">Gross</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">PF</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">ESI</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">PT</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">Tax</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">Total Ded.</th>
                      <th className="px-4 py-2.5 text-caption text-muted font-medium text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {employeeDetail.map((emp, i) => (
                      <tr key={i} className={`hover:bg-surface-soft/50 ${!emp.hasSalary ? 'bg-warning/5' : ''}`}>
                        <td className="px-4 py-2.5">
                          <p className="text-body-sm font-medium text-ink">{emp.name}</p>
                          <p className="text-caption text-muted">{emp.designation}</p>
                          {!emp.hasSalary && (
                            <p className="text-[10px] text-orange-500 font-medium mt-0.5">No salary assigned</p>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-caption text-muted">{emp.department}</td>
                        <td className="px-4 py-2.5 text-body-sm text-ink text-right">₹{emp.basic.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm text-ink text-right">₹{emp.hra.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm text-ink text-right">₹{emp.allowances.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm font-medium text-ink text-right">₹{emp.gross.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm text-error text-right">₹{emp.pf.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm text-error text-right">₹{emp.esi.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm text-error text-right">₹{emp.pt.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm text-error text-right">₹{emp.incomeTax.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm font-medium text-error text-right">₹{emp.totalDeductions.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2.5 text-body-sm font-medium text-success text-right">₹{emp.net.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {employeeDetail.filter(e => !e.hasSalary).length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-sm font-medium text-ink">
                    {employeeDetail.filter(e => !e.hasSalary).length} employee{employeeDetail.filter(e => !e.hasSalary).length > 1 ? 's have' : ' has'} no salary assigned
                  </p>
                  <p className="text-caption text-muted">
                    These employees will be skipped during payroll processing. Assign a salary structure before running payroll.
                  </p>
                </div>
              </div>
            )}

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
                <span className="font-medium text-ink">{new Date(payMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>. This will generate payslips and
                mark salaries for disbursement.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-surface-card rounded-lg p-3">
                  <p className="text-caption text-muted">Employees</p>
                  <p className="text-title-sm text-ink">{totalEmployees}</p>
                </div>
                <div className="bg-surface-card rounded-lg p-3">
                  <p className="text-caption text-muted">Net Payable</p>
                  <p className="text-title-sm text-ink">₹{((totalGross - totalDeductions) / 100000).toFixed(1)}L</p>
                </div>
                <div className="bg-surface-card rounded-lg p-3">
                  <p className="text-caption text-muted">Period</p>
                  <p className="text-title-sm text-ink">{new Date(payMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
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
