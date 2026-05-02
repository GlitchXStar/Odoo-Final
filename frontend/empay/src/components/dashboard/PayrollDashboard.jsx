import {
  DollarSign, TrendingUp, TrendingDown, Users,
  ArrowRight, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const payrollStats = [
  { label: 'Gross Salary', value: '₹52.3L', change: '+3.8%', trend: 'up', icon: DollarSign },
  { label: 'Total Deductions', value: '₹9.8L', change: '+1.2%', trend: 'up', icon: TrendingDown },
  { label: 'Net Disbursed', value: '₹42.5L', change: '+4.2%', trend: 'up', icon: TrendingUp },
  { label: 'Employees Processed', value: '1,230', change: '98.5%', trend: 'up', icon: Users },
];

const processingStatus = [
  { month: 'May 2026', status: 'pending', processed: 0, total: 1248 },
  { month: 'Apr 2026', status: 'completed', processed: 1230, total: 1230 },
  { month: 'Mar 2026', status: 'completed', processed: 1215, total: 1215 },
  { month: 'Feb 2026', status: 'completed', processed: 1200, total: 1200 },
];

const salaryDistribution = [
  { range: '< ₹25K', count: 180, percentage: 15 },
  { range: '₹25K - ₹50K', count: 420, percentage: 34 },
  { range: '₹50K - ₹75K', count: 350, percentage: 28 },
  { range: '₹75K - ₹1L', count: 198, percentage: 16 },
  { range: '> ₹1L', count: 100, percentage: 8 },
];

const statusIcon = {
  completed: <CheckCircle size={16} className="text-success" />,
  pending: <AlertCircle size={16} className="text-warning" />,
};

export default function PayrollDashboard() {
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
            {processingStatus.map((run) => (
              <div key={run.month} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcon[run.status]}
                  <div>
                    <p className="text-body-sm font-medium text-ink">{run.month}</p>
                    <p className="text-caption text-muted">
                      {run.status === 'completed'
                        ? `${run.processed} employees processed`
                        : 'Not yet processed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge badge-${run.status === 'completed' ? 'approved' : 'pending'}`}>
                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                  </span>
                  {run.status === 'pending' && (
                    <a href="/app/payroll/process" className="px-3 py-1.5 text-caption font-medium bg-ink text-on-primary rounded-md hover:bg-[#242424] transition-colors">
                      Process
                    </a>
                  )}
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
                  <span className="text-caption text-muted">{range.count}</span>
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
