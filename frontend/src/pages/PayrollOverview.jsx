import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Users, ArrowRight,
  CheckCircle, AlertCircle, Play, Download, ChevronDown, Calendar
} from 'lucide-react';
import { payroll, salaryStructures } from '../services/api.js';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function PayrollOverview() {
  const [payrollData, setPayrollData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMonth, setFilterMonth] = useState(0); // 0 = All
  const [filterYear, setFilterYear] = useState(0);   // 0 = All

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const payrollRes = await payroll.getAll();
      const payRaw = payrollRes?.data ?? payrollRes;
      setPayrollData(Array.isArray(payRaw) ? payRaw : []);
      try {
        const salRes = await salaryStructures.getAll();
        const salRaw = salRes?.data ?? salRes;
        setSalaryData(Array.isArray(salRaw) ? salRaw : []);
      } catch { setSalaryData([]); }
    } catch (err) {
      setError(err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  // Filter payroll data by month/year
  const filteredPayroll = payrollData.filter((r) => {
    if (filterMonth && r.month !== filterMonth) return false;
    if (filterYear && r.year !== filterYear) return false;
    return true;
  });

  // Group payroll records by month label
  const historyMap = {};
  filteredPayroll.forEach((r) => {
    const key = r.month && r.year ? `${new Date(0, r.month - 1).toLocaleString('en-IN', { month: 'long' })} ${r.year}` : 'Unknown';
    if (!historyMap[key]) historyMap[key] = { key, count: 0, status: r.status, runDate: r.processed_at || r.created_at };
    historyMap[key].count++;
  });
  const processingHistory = Object.values(historyMap);

  // Salary distribution from salary_structure (active records)
  const distSource = salaryData.length > 0 ? salaryData : payrollData;
  const buckets = [{ range: '< ₹30K', min: 0, max: 30000 }, { range: '₹30K–₹50K', min: 30000, max: 50000 }, { range: '₹50K–₹80K', min: 50000, max: 80000 }, { range: '> ₹80K', min: 80000, max: Infinity }];
  const maxCount = Math.max(1, ...buckets.map((b) => distSource.filter((r) => Number(r.gross_salary) >= b.min && Number(r.gross_salary) < b.max).length));
  const salaryDistribution = buckets.map((b) => {
    const count = distSource.filter((r) => Number(r.gross_salary) >= b.min && Number(r.gross_salary) < b.max).length;
    return { range: b.range, count, percentage: Math.round((count / maxCount) * 100) };
  });

  // Calculate totals from filtered payroll records
  const totalGross = filteredPayroll.reduce((s, r) => s + Number(r.gross_salary || 0), 0);
  const totalDeductions = filteredPayroll.reduce((s, r) => s + Number(r.total_deductions || 0), 0);
  const totalNet = filteredPayroll.reduce((s, r) => s + Number(r.net_salary || 0), 0);
  const totalProcessed = new Set(filteredPayroll.map((r) => r.user_id)).size;

  const exportPayrollCSV = () => {
    const rows = [['Employee','Month','Year','Gross','Deductions','Net','Status']];
    filteredPayroll.forEach((r) => {
      rows.push([
        `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.user_id,
        MONTHS[(r.month || 1) - 1], r.year,
        r.gross_salary, r.total_deductions, r.net_salary, r.status || 'Processed',
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `payroll${filterMonth ? '-' + MONTHS[filterMonth-1] : ''}${filterYear ? '-' + filterYear : ''}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

  const payrollStats = [
    { label: 'Gross Salary', value: fmt(totalGross), symbol: '₹' },
    { label: 'Total Deductions', value: fmt(totalDeductions), symbol: '₹' },
    { label: 'Net Disbursed', value: fmt(totalNet), symbol: '₹' },
    { label: 'Employees Processed', value: totalProcessed, icon: Users },
  ];

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

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Payroll</h1>
          <p className="text-body-sm text-muted mt-1">
            Process salaries, track disbursements, and manage payroll operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportPayrollCSV} className="btn-secondary inline-flex items-center gap-2" disabled={filteredPayroll.length === 0}>
            <Download size={16} />
            Export CSV
          </button>
          <Link to="/app/payroll/process" className="btn-primary inline-flex items-center gap-2">
            <Play size={16} />
            Run Payroll
          </Link>
        </div>
      </div>

      {/* Month/Year Filter */}
      <div className="flex items-center gap-3 mb-6 bg-canvas border border-hairline rounded-lg px-4 py-3">
        <Calendar size={16} className="text-muted" />
        <span className="text-body-sm text-muted">Filter:</span>
        <div className="relative">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="input-field py-1.5 pl-3 pr-8 text-body-sm appearance-none cursor-pointer min-w-[130px]"
          >
            <option value={0}>All Months</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="input-field py-1.5 pl-3 pr-8 text-body-sm appearance-none cursor-pointer min-w-[90px]"
          >
            <option value={0}>All Years</option>
            {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {(filterMonth || filterYear) && (
          <button
            onClick={() => { setFilterMonth(0); setFilterYear(0); }}
            className="text-caption text-muted hover:text-ink transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {payrollStats.map((stat) => (
          <div key={stat.label} className="bg-canvas border border-hairline rounded-lg p-5 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted">{stat.label}</span>
              <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center">
                {stat.icon ? <stat.icon size={18} className="text-muted" /> : <span className="text-title-sm text-muted font-medium">{stat.symbol}</span>}
              </div>
            </div>
            <p className="text-title-lg text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Two-column: History + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Processing History */}
        <div className="lg:col-span-3 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <h3 className="text-title-sm text-ink">Processing History</h3>
            <Link to="/app/payroll/payslips" className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
              View payslips <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-hairline">
            {processingHistory.length === 0 ? (
              <p className="px-5 py-8 text-body-sm text-muted text-center">No payroll records yet.</p>
            ) : processingHistory.map((run) => (
              <div key={run.key} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {['Processed','Approved','Paid'].includes(run.status) ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : (
                    <AlertCircle size={16} className="text-warning" />
                  )}
                  <div>
                    <p className="text-body-sm font-medium text-ink">{run.key}</p>
                    <p className="text-caption text-muted">
                      {run.count} employee{run.count !== 1 ? 's' : ''}{run.runDate ? ` · Run on ${new Date(run.runDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${['Processed','Approved','Paid'].includes(run.status) ? 'badge-approved' : 'badge-pending'}`}>
                    {run.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Distribution */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Salary Distribution</h3>
          </div>
          <div className="p-5 space-y-4">
            {salaryDistribution.map((range) => (
              <div key={range.range}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-body-sm text-ink">{range.range}</span>
                  <span className="text-caption text-muted">{range.count} employees</span>
                </div>
                <div className="w-full h-2 bg-surface-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink rounded-full transition-all duration-500"
                    style={{ width: `${range.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
