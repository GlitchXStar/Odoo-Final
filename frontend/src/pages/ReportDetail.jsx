import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { reports } from '../services/api.js';

const CURRENCY_COLS = new Set(['basic','hra','allowances','bonus','gross_salary','pf_deduction','esi_deduction','professional_tax','income_tax','tds','total_deductions','net_salary','avg_salary']);
const DATE_COLS = new Set(['start_date','end_date','created_at','approved_at']);
const BOOL_COLS = new Set(['pan_verified','bank_verified']);

function toTitleCase(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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

function exportCSV(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const prettyHeaders = headers.map(toTitleCase).join(',');
  const dataRows = rows.map((r) => headers.map((h) => csvEscape(fmtCell(h, r[h]))).join(','));
  const csv = [prettyHeaders, ...dataRows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const REPORT_META = {
  headcount: {
    title: 'Headcount Report',
    description: 'Employee count by department, designation, and status',
  },
  attendance: {
    title: 'Attendance Report',
    description: 'Monthly attendance summary per employee',
  },
  leave: {
    title: 'Leave Report',
    description: 'Leave requests with type, duration, and status',
  },
  payroll: {
    title: 'Payroll Report',
    description: 'Salary disbursement, deductions, and net pay',
  },
  attrition: {
    title: 'Attrition Report',
    description: 'Employee turnover and retention by department',
  },
  compliance: {
    title: 'Compliance Report',
    description: 'PF, ESI, PT, and TDS compliance per employee',
  },
};

const FETCHER = {
  headcount: (m, y) => reports.getHeadcount(m, y),
  attendance: (m, y) => reports.getAttendance(m, y),
  leave: (m, y) => reports.getLeave(m, y),
  payroll: (m, y) => reports.getPayroll(m, y),
  attrition: (m, y) => reports.getAttrition(m, y),
  compliance: (m, y) => reports.getCompliance(m, y),
};

function fmt(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function fmtRs(n) {
  if (n == null) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }) {
  const map = {
    Approved: 'bg-success/10 text-success',
    Pending: 'bg-warning/10 text-warning',
    Rejected: 'bg-error/10 text-error',
    Processed: 'bg-primary/10 text-primary',
    Paid: 'bg-success/10 text-success',
    Active: 'bg-success/10 text-success',
    Inactive: 'bg-error/10 text-error',
    'On Leave': 'bg-warning/10 text-warning',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption font-medium ${map[status] || 'bg-surface-card text-muted'}`}>
      {status}
    </span>
  );
}

function HeadcountTable({ data }) {
  const grouped = data.reduce((acc, row) => {
    const key = row.department || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-hairline bg-surface-soft">
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Designation</th>
          <th className="text-center px-5 py-3 text-caption text-muted font-medium">Status</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Count</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">New Hires</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {Object.entries(grouped).map(([dept, rows]) =>
          rows.map((row, i) => (
            <tr key={`${dept}-${i}`} className="hover:bg-surface-soft/50 transition-colors">
              {i === 0 && (
                <td className="px-5 py-3.5 text-body-sm font-medium text-ink" rowSpan={rows.length}>
                  {dept}
                </td>
              )}
              <td className="px-5 py-3.5 text-body-sm text-ink">{row.designation || '—'}</td>
              <td className="px-5 py-3.5 text-center"><StatusBadge status={row.status} /></td>
              <td className="px-5 py-3.5 text-body-sm text-ink text-right">{row.count}</td>
              <td className="px-5 py-3.5 text-body-sm text-ink text-right">{row.new_hires}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function AttendanceTable({ data }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-hairline bg-surface-soft">
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employee</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Dept</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Present</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Absent</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Half-Day</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Late</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Avg Hrs</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Attendance%</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
            <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{row.employee_name}</td>
            <td className="px-5 py-3.5 text-body-sm text-muted">{row.department || '—'}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{row.present}</td>
            <td className="px-5 py-3.5 text-body-sm text-right">
              <span className={row.absent > 3 ? 'text-error' : 'text-ink'}>{row.absent}</span>
            </td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{row.half_day}</td>
            <td className="px-5 py-3.5 text-body-sm text-right">
              <span className={row.late_arrivals > 2 ? 'text-warning' : 'text-ink'}>{row.late_arrivals}</span>
            </td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{row.avg_work_hours}h</td>
            <td className="px-5 py-3.5 text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="w-14 h-1.5 bg-surface-card rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${row.attendance_pct}%` }} />
                </div>
                <span className="text-body-sm text-ink w-8 text-right">{row.attendance_pct}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LeaveTable({ data }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-hairline bg-surface-soft">
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employee</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Leave Type</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">From</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">To</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Days</th>
          <th className="text-center px-5 py-3 text-caption text-muted font-medium">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
            <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{row.employee_name}</td>
            <td className="px-5 py-3.5 text-body-sm text-muted">{row.department || '—'}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink">{row.leave_type}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink">{fmtDate(row.start_date)}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink">{fmtDate(row.end_date)}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{row.total_days}</td>
            <td className="px-5 py-3.5 text-center"><StatusBadge status={row.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PayrollTable({ data }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-hairline bg-surface-soft">
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employee</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Dept</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Basic</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Gross</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">PF</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">ESI</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">TDS</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Deductions</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Net Pay</th>
          <th className="text-center px-5 py-3 text-caption text-muted font-medium">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
            <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{row.employee_name}</td>
            <td className="px-5 py-3.5 text-body-sm text-muted">{row.department || '—'}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{fmtRs(row.basic)}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{fmtRs(row.gross_salary)}</td>
            <td className="px-5 py-3.5 text-body-sm text-muted text-right">{fmtRs(row.pf_deduction)}</td>
            <td className="px-5 py-3.5 text-body-sm text-muted text-right">{fmtRs(row.esi_deduction)}</td>
            <td className="px-5 py-3.5 text-body-sm text-muted text-right">{fmtRs(row.income_tax)}</td>
            <td className="px-5 py-3.5 text-body-sm text-error text-right">{fmtRs(row.total_deductions)}</td>
            <td className="px-5 py-3.5 text-body-sm font-semibold text-ink text-right">{fmtRs(row.net_salary)}</td>
            <td className="px-5 py-3.5 text-center"><StatusBadge status={row.status} /></td>
          </tr>
        ))}
      </tbody>
      {data.length > 0 && (
        <tfoot className="border-t-2 border-hairline bg-surface-soft">
          <tr>
            <td colSpan={2} className="px-5 py-3 text-body-sm font-semibold text-ink">Total</td>
            <td className="px-5 py-3 text-body-sm font-semibold text-ink text-right">
              {fmtRs(data.reduce((s, r) => s + Number(r.basic || 0), 0))}
            </td>
            <td className="px-5 py-3 text-body-sm font-semibold text-ink text-right">
              {fmtRs(data.reduce((s, r) => s + Number(r.gross_salary || 0), 0))}
            </td>
            <td colSpan={3} />
            <td className="px-5 py-3 text-body-sm font-semibold text-error text-right">
              {fmtRs(data.reduce((s, r) => s + Number(r.total_deductions || 0), 0))}
            </td>
            <td className="px-5 py-3 text-body-sm font-semibold text-ink text-right">
              {fmtRs(data.reduce((s, r) => s + Number(r.net_salary || 0), 0))}
            </td>
            <td />
          </tr>
        </tfoot>
      )}
    </table>
  );
}

function AttritionTable({ data }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-hairline bg-surface-soft">
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Total</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Active</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Inactive</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">On Leave</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Attrition Rate</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
            <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{row.department || 'Unassigned'}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{row.total}</td>
            <td className="px-5 py-3.5 text-body-sm text-success text-right">{row.active}</td>
            <td className="px-5 py-3.5 text-body-sm text-error text-right">{row.inactive}</td>
            <td className="px-5 py-3.5 text-body-sm text-warning text-right">{row.on_leave}</td>
            <td className="px-5 py-3.5 text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="w-16 h-1.5 bg-surface-card rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(Number(row.attrition_rate), 100)}%`,
                      backgroundColor: Number(row.attrition_rate) > 15 ? 'var(--color-error)' : 'var(--color-warning)',
                    }}
                  />
                </div>
                <span className={`text-body-sm w-10 text-right ${Number(row.attrition_rate) > 15 ? 'text-error' : 'text-ink'}`}>
                  {row.attrition_rate}%
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ComplianceTable({ data }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-hairline bg-surface-soft">
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employee</th>
          <th className="text-left px-5 py-3 text-caption text-muted font-medium">Dept</th>
          <th className="text-center px-5 py-3 text-caption text-muted font-medium">PAN</th>
          <th className="text-center px-5 py-3 text-caption text-muted font-medium">Bank</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">PF</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">ESI</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Prof. Tax</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">Income Tax</th>
          <th className="text-right px-5 py-3 text-caption text-muted font-medium">TDS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
            <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{row.employee_name}</td>
            <td className="px-5 py-3.5 text-body-sm text-muted">{row.department || '—'}</td>
            <td className="px-5 py-3.5 text-center">
              {row.pan_verified
                ? <CheckCircle size={16} className="text-success mx-auto" />
                : <XCircle size={16} className="text-error mx-auto" />}
            </td>
            <td className="px-5 py-3.5 text-center">
              {row.bank_verified
                ? <CheckCircle size={16} className="text-success mx-auto" />
                : <XCircle size={16} className="text-error mx-auto" />}
            </td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{fmtRs(row.pf_deduction)}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{fmtRs(row.esi_deduction)}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{fmtRs(row.professional_tax)}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{fmtRs(row.income_tax)}</td>
            <td className="px-5 py-3.5 text-body-sm text-ink text-right">{fmtRs(row.tds)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderTable(type, data) {
  if (type === 'headcount') return <HeadcountTable data={data} />;
  if (type === 'attendance') return <AttendanceTable data={data} />;
  if (type === 'leave') return <LeaveTable data={data} />;
  if (type === 'payroll') return <PayrollTable data={data} />;
  if (type === 'attrition') return <AttritionTable data={data} />;
  if (type === 'compliance') return <ComplianceTable data={data} />;
  return null;
}

export default function ReportDetail() {
  const { type } = useParams();
  const navigate = useNavigate();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [year, month] = selectedMonth.split('-').map(Number);
  const meta = REPORT_META[type];

  useEffect(() => {
    if (!FETCHER[type]) return;
    setLoading(true);
    setError(null);
    FETCHER[type](month, year)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, month, year]);

  if (!meta) {
    return (
      <div className="max-w-content mx-auto py-12 text-center text-muted">
        Report type not found.
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/reports')}
            className="w-9 h-9 rounded-lg border border-hairline flex items-center justify-center hover:bg-surface-soft transition-colors"
          >
            <ArrowLeft size={16} className="text-muted" />
          </button>
          <div>
            <h1 className="font-cal text-display-md text-ink">{meta.title}</h1>
            <p className="text-body-sm text-muted mt-0.5">{meta.description}</p>
          </div>
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
            onClick={() => exportCSV(`${meta.title.replace(/\s+/g, '_')}_${selectedMonth}.csv`, data)}
            disabled={loading || data.length === 0}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-body-sm text-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-lg">
        <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between">
          <span className="text-body-sm text-muted">
            {loading ? 'Loading…' : `${data.length} record${data.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-muted" />
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-body-sm text-muted">
              No data available for this period.
            </div>
          ) : (
            renderTable(type, data)
          )}
        </div>
      </div>
    </div>
  );
}
