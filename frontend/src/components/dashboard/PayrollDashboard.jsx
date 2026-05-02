import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Users,
  ArrowRight, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { dashboard, payroll } from '../../services/api.js';

const fmt = (val) => {
  const n = parseFloat(val) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const statusIcon = {
  Processed: <CheckCircle size={16} className="text-success" />,
  Approved: <CheckCircle size={16} className="text-success" />,
  Paid: <CheckCircle size={16} className="text-success" />,
  Pending: <AlertCircle size={16} className="text-warning" />,
  Draft: <AlertCircle size={16} className="text-warning" />,
};

export default function PayrollDashboard() {
  const [stats, setStats] = useState(null);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, payRes] = await Promise.all([
          dashboard.getStats(),
          payroll.getAll(),
        ]);
        setStats(statsRes?.data || statsRes || {});
        setPayrollRuns(Array.isArray(payRes?.data) ? payRes.data : Array.isArray(payRes) ? payRes : []);
      } catch (e) {
        console.error('Payroll dashboard error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pay = stats?.payrollSummary || {};
  const emp = stats?.employees || {};

  const grossTotal = payrollRuns.reduce((s, r) => s + parseFloat(r.gross_salary || 0), 0);
  const deductTotal = payrollRuns.reduce((s, r) => s + parseFloat(r.total_deductions || 0), 0);
  const netTotal = payrollRuns.reduce((s, r) => s + parseFloat(r.net_salary || 0), 0);

  const payrollStats = [
    { label: 'Gross Salary', value: grossTotal ? fmt(grossTotal) : '—', change: `${payrollRuns.length} records`, trend: 'up', icon: DollarSign },
    { label: 'Total Deductions', value: deductTotal ? fmt(deductTotal) : '—', change: 'PF + Tax + PT', trend: 'up', icon: TrendingDown },
    { label: 'Net Disbursed', value: netTotal ? fmt(netTotal) : '—', change: 'take-home total', trend: 'up', icon: TrendingUp },
    { label: 'Employees Processed', value: pay.total_processed ?? payrollRuns.length, change: `of ${emp.total_employees ?? '—'}`, trend: 'up', icon: Users },
  ];

  // Group payroll runs by month/year
  const grouped = payrollRuns.reduce((acc, r) => {
    const key = `${r.month_name || r.month} ${r.year}`;
    if (!acc[key]) acc[key] = { key, status: r.status, count: 0 };
    acc[key].count++;
    return acc;
  }, {});
  const processingStatus = Object.values(grouped).slice(0, 5);

  if (loading) {
    return (
      <div className="max-w-content mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cal text-display-md text-ink">Payroll Dashboard</h1>
          <p className="text-body-sm text-muted mt-1">
            Process salaries, track disbursements, and manage payroll operations.
          </p>
        </div>
        <a href="/app/payroll/process" className="btn-primary inline-flex items-center gap-2">
          Run Payroll
          <ArrowRight size={16} />
        </a>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {payrollStats.map((stat) => (
          <div key={stat.label} className="bg-canvas border border-hairline rounded-lg p-5 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted">{stat.label}</span>
              <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center">
                <stat.icon size={18} className="text-muted" />
              </div>
            </div>
            <p className="text-title-lg text-ink">{stat.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp size={14} className="text-success" />
              <span className="text-caption text-success">{stat.change}</span>
              <span className="text-caption text-muted">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Processing History */}
        <div className="lg:col-span-3 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <h3 className="text-title-sm text-ink">Processing History</h3>
            <a href="/app/payroll/payslips" className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
              View payslips
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="divide-y divide-hairline">
            {processingStatus.length === 0 ? (
              <p className="px-5 py-8 text-body-sm text-muted text-center">No payroll records yet.</p>
            ) : processingStatus.map((run) => (
              <div key={run.key} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcon[run.status] || <AlertCircle size={16} className="text-muted" />}
                  <div>
                    <p className="text-body-sm font-medium text-ink">{run.key}</p>
                    <p className="text-caption text-muted">
                      {run.count} employee{run.count !== 1 ? 's' : ''} processed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge badge-${['Processed','Approved','Paid'].includes(run.status) ? 'approved' : 'pending'}`}>
                    {run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">This Year Summary</h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Total Gross', value: fmt(grossTotal) },
              { label: 'Total Deductions', value: fmt(deductTotal) },
              { label: 'Total Net Pay', value: fmt(netTotal) },
              { label: 'Payroll Runs', value: payrollRuns.length },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1 border-b border-hairline last:border-0">
                <span className="text-body-sm text-muted">{item.label}</span>
                <span className="text-body-sm font-medium text-ink">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
