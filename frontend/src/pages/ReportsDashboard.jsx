import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Calendar, Users,
  CalendarDays, CalendarOff, TrendingUp, BarChart3,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';

import { reports } from '../services/api.js';

const CURRENCY_COLS = new Set(['basic','hra','allowances','bonus','gross_salary','pf_deduction','esi_deduction','professional_tax','income_tax','tds','total_deductions','net_salary','Payroll_Cost_INR','avg_salary']);
const DATE_COLS = new Set(['start_date','end_date','created_at','approved_at']);
const BOOL_COLS = new Set(['pan_verified','bank_verified']);

function toTitleCase(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtCell(key, v) {
  if (v == null || v === '') return '';
  if (BOOL_COLS.has(key)) return v === true || v === 'true' ? 'Yes' : 'No';
  if (DATE_COLS.has(key)) {
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (CURRENCY_COLS.has(key)) {
    const n = parseFloat(v);
    return isNaN(n) ? v : `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return v;
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function sectionCSV(title, rows) {
  const SEP = `=== ${title.toUpperCase()} ${'='.repeat(Math.max(0, 40 - title.length))}\n`;
  if (!rows || rows.length === 0) return `${SEP}No data available\n`;
  const headers = Object.keys(rows[0]);
  const prettyHeaders = headers.map(toTitleCase).join(',');
  const dataRows = rows.map((r) =>
    headers.map((h) => csvEscape(fmtCell(h, r[h]))).join(',')
  );
  return [SEP.trimEnd(), prettyHeaders, ...dataRows, ''].join('\n');
}

function downloadBlob(filename, content) {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const RupeeSign = ({ size = 18 }) => (
  <span style={{ fontSize: size, lineHeight: 1, fontWeight: 600 }}>₹</span>
);

const quickReports = [
  { label: 'Headcount Report', description: 'Employee count by department, status, and join date', icon: Users, type: 'headcount' },
  { label: 'Attendance Report', description: 'Daily/monthly attendance with late arrivals and absences', icon: CalendarDays, type: 'attendance' },
  { label: 'Leave Report', description: 'Leave utilization, balance, and approval rates', icon: CalendarOff, type: 'leave' },
  { label: 'Payroll Report', description: 'Salary disbursement, deductions, and cost analysis', icon: RupeeSign, type: 'payroll' },
  { label: 'Attrition Report', description: 'Employee turnover, exit trends, and retention metrics', icon: TrendingUp, type: 'attrition' },
  { label: 'Compliance Report', description: 'PF, ESI, and tax filing compliance status', icon: BarChart3, type: 'compliance' },
];

function formatPayroll(amount) {
  if (!amount) return '₹0';
  const lakhs = amount / 100000;
  return `₹${lakhs.toFixed(1)}L`;
}

function formatSalary(amount) {
  if (!amount) return '₹0';
  const k = amount / 1000;
  return `₹${Math.round(k)}K`;
}

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [summary, setSummary] = useState(null);
  const [departmentData, setDepartmentData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [leaveDistribution, setLeaveDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [year, month] = selectedMonth.split('-').map(Number);

  const handleFullExport = async () => {
    setExporting(true);
    try {
      const [hc, att, lv, pay, att2, comp, trend, leaveDist] = await Promise.all([
        reports.getHeadcount(month, year),
        reports.getAttendance(month, year),
        reports.getLeave(month, year),
        reports.getPayroll(month, year),
        reports.getAttrition(month, year),
        reports.getCompliance(month, year),
        reports.getMonthlyTrend(year),
        reports.getLeaveDistribution(month, year),
      ]);

      const summaryRows = summary ? [{
        Total_Employees: summary.totalEmployees,
        Avg_Attendance_Pct: summary.avgAttendance,
        Leave_Requests: summary.leaveRequests,
        Payroll_Cost_INR: summary.payrollCost,
      }] : [];

      const csv = [
        sectionCSV(`Full Report - ${selectedMonth}`, []),
        sectionCSV('SUMMARY', summaryRows),
        sectionCSV('HEADCOUNT', hc.data),
        sectionCSV('ATTENDANCE', att.data),
        sectionCSV('LEAVE REQUESTS', lv.data),
        sectionCSV('PAYROLL', pay.data),
        sectionCSV('ATTRITION', att2.data),
        sectionCSV('COMPLIANCE', comp.data),
        sectionCSV('MONTHLY TREND', trend.data),
        sectionCSV('LEAVE DISTRIBUTION', leaveDist.data),
      ].join('\n');

      downloadBlob(`Full_Report_${selectedMonth}.csv`, csv);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      reports.getSummary(month, year),
      reports.getDepartments(month, year),
      reports.getMonthlyTrend(year),
      reports.getLeaveDistribution(month, year),
    ])
      .then(([summaryRes, deptRes, trendRes, leaveRes]) => {
        setSummary(summaryRes.data);
        setDepartmentData(deptRes.data);
        setMonthlyTrend(trendRes.data);
        setLeaveDistribution(leaveRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month, year]);

  const reportCards = summary
    ? [
        { label: 'Total Employees', value: summary.totalEmployees.toLocaleString(), icon: Users },
        { label: 'Avg Attendance', value: `${summary.avgAttendance}%`, icon: CalendarDays },
        { label: 'Leave Requests', value: summary.leaveRequests.toLocaleString(), icon: CalendarOff },
        { label: 'Payroll Cost', value: formatPayroll(summary.payrollCost), icon: RupeeSign },
      ]
    : [];

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Reports</h1>
          <p className="text-body-sm text-muted mt-1">
            Organization analytics and downloadable reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field py-1.5 w-auto text-body-sm"
            />
          </div>
          <button
            onClick={handleFullExport}
            disabled={loading || exporting}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-body-sm text-error">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-canvas border border-hairline rounded-lg p-5 animate-pulse">
                <div className="h-3 w-24 bg-surface-card rounded mb-4" />
                <div className="h-6 w-16 bg-surface-card rounded mb-2" />
                <div className="h-3 w-32 bg-surface-card rounded" />
              </div>
            ))
          : reportCards.map((card) => (
              <div key={card.label} className="bg-canvas border border-hairline rounded-lg p-5 hover:shadow-soft transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-caption text-muted">{card.label}</span>
                  <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center">
                    <card.icon size={18} className="text-muted" />
                  </div>
                </div>
                <p className="text-title-lg text-ink">{card.value}</p>
              </div>
            ))}
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-canvas border border-hairline rounded-lg mb-6">
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
          <h3 className="text-title-sm text-ink">Department Breakdown</h3>
          <button
            onClick={() => exportCSV(`Department_Breakdown_${selectedMonth}.csv`, departmentData)}
            disabled={loading || departmentData.length === 0}
            className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={12} /> Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Headcount</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Attendance %</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Leave Rate %</th>
                <th className="text-right px-5 py-3 text-caption text-muted font-medium">Avg. Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center">
                    <Loader2 size={20} className="animate-spin text-muted mx-auto" />
                  </td>
                </tr>
              ) : departmentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-body-sm text-muted">No department data available.</td>
                </tr>
              ) : (
                departmentData.map((dept) => (
                  <tr key={dept.dept} className="hover:bg-surface-soft/50 transition-colors">
                    <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{dept.dept}</td>
                    <td className="px-5 py-3.5 text-body-sm text-ink text-right">{dept.headcount}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-surface-card rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${dept.attendance}%` }} />
                        </div>
                        <span className="text-body-sm text-ink w-10 text-right">{dept.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-body-sm ${dept.leave_rate > 10 ? 'text-error' : 'text-ink'}`}>
                        {dept.leave_rate}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-body-sm font-medium text-ink text-right">
                      {formatSalary(dept.avg_salary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column: Trend + Leave Types */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="lg:col-span-3 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Monthly Trend ({year})</h3>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left pb-3 text-caption text-muted font-medium">Month</th>
                    <th className="text-right pb-3 text-caption text-muted font-medium">Employees</th>
                    <th className="text-right pb-3 text-caption text-muted font-medium">Payroll (₹L)</th>
                    <th className="text-right pb-3 text-caption text-muted font-medium">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <Loader2 size={20} className="animate-spin text-muted mx-auto" />
                      </td>
                    </tr>
                  ) : monthlyTrend.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-body-sm text-muted">No trend data available.</td>
                    </tr>
                  ) : (
                    monthlyTrend.map((row) => (
                      <tr key={row.month}>
                        <td className="py-3 text-body-sm font-medium text-ink">{row.month}</td>
                        <td className="py-3 text-body-sm text-ink text-right">{row.employees}</td>
                        <td className="py-3 text-body-sm text-ink text-right">{parseFloat(row.payroll).toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 h-1.5 bg-surface-card rounded-full overflow-hidden">
                              <div className="h-full bg-ink rounded-full" style={{ width: `${row.attendance}%` }} />
                            </div>
                            <span className="text-body-sm text-ink w-10 text-right">{row.attendance}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Leave Distribution</h3>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-muted" />
              </div>
            ) : leaveDistribution.length === 0 ? (
              <p className="text-body-sm text-muted text-center py-8">No leave data available.</p>
            ) : (
              leaveDistribution.map((type) => (
                <div key={type.type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-body-sm text-ink">{type.type}</span>
                    <span className="text-caption text-muted">{type.count}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ink rounded-full transition-all duration-500"
                      style={{ width: `${type.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="mb-2">
        <h3 className="text-title-sm text-ink mb-4">Quick Reports</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickReports.map((report) => (
          <button
            key={report.label}
            onClick={() => navigate(`/app/reports/${report.type}`)}
            className="bg-canvas border border-hairline rounded-lg p-5 text-left hover:border-ink/20 hover:shadow-soft transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-on-primary transition-all">
                <report.icon size={18} className="text-muted" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-ink">{report.label}</p>
                <p className="text-caption text-muted mt-0.5">{report.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
