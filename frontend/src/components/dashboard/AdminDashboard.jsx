import {
  Users, UserCheck, CalendarOff, DollarSign,
  TrendingUp, TrendingDown, Clock, AlertCircle
} from 'lucide-react';

const stats = [
  {
    label: 'Total Employees',
    value: '1,248',
    change: '+12',
    trend: 'up',
    icon: Users,
    period: 'this month',
  },
  {
    label: 'Present Today',
    value: '1,089',
    change: '87%',
    trend: 'up',
    icon: UserCheck,
    period: 'attendance rate',
  },
  {
    label: 'On Leave',
    value: '42',
    change: '+3',
    trend: 'neutral',
    icon: CalendarOff,
    period: 'today',
  },
  {
    label: 'Payroll This Month',
    value: '₹42.5L',
    change: '+4.2%',
    trend: 'up',
    icon: DollarSign,
    period: 'vs last month',
  },
];

const recentActivity = [
  { user: 'Priya Sharma', action: 'applied for Casual Leave', time: '2 min ago', status: 'pending' },
  { user: 'Rajesh Kumar', action: 'checked in', time: '15 min ago', status: 'present' },
  { user: 'Anjali Patel', action: 'payslip generated', time: '1 hour ago', status: 'approved' },
  { user: 'Vikram Singh', action: 'marked absent', time: '2 hours ago', status: 'absent' },
  { user: 'Sneha Desai', action: 'applied for Sick Leave', time: '3 hours ago', status: 'pending' },
];

const departmentBreakdown = [
  { name: 'Engineering', count: 320, percentage: 26 },
  { name: 'Marketing', count: 180, percentage: 14 },
  { name: 'Sales', count: 250, percentage: 20 },
  { name: 'HR', count: 85, percentage: 7 },
  { name: 'Finance', count: 120, percentage: 10 },
  { name: 'Operations', count: 293, percentage: 23 },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-content mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cal text-display-md text-ink">Dashboard</h1>
          <p className="text-body-sm text-muted mt-1">
            Welcome back. Here's what's happening across your organization.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-pill text-caption text-muted">
          <Clock size={14} />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-canvas border border-hairline rounded-lg p-5 hover:shadow-soft transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted">{stat.label}</span>
              <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center">
                <stat.icon size={18} className="text-muted" />
              </div>
            </div>
            <p className="text-title-lg text-ink">{stat.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {stat.trend === 'up' ? (
                <TrendingUp size={14} className="text-success" />
              ) : stat.trend === 'down' ? (
                <TrendingDown size={14} className="text-error" />
              ) : (
                <AlertCircle size={14} className="text-warning" />
              )}
              <span className={`text-caption ${
                stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-error' : 'text-warning'
              }`}>
                {stat.change}
              </span>
              <span className="text-caption text-muted">{stat.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <h3 className="text-title-sm text-ink">Recent Activity</h3>
            <button className="text-caption text-muted hover:text-ink transition-colors">
              View all
            </button>
          </div>
          <div className="divide-y divide-hairline">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                    {item.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-body-sm text-ink">
                      <span className="font-medium">{item.user}</span>{' '}
                      <span className="text-muted">{item.action}</span>
                    </p>
                    <p className="text-caption text-muted">{item.time}</p>
                  </div>
                </div>
                <span className={`badge badge-${item.status}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Department Breakdown</h3>
          </div>
          <div className="p-5 space-y-4">
            {departmentBreakdown.map((dept) => (
              <div key={dept.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-body-sm text-ink">{dept.name}</span>
                  <span className="text-caption text-muted">{dept.count}</span>
                </div>
                <div className="w-full h-2 bg-surface-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink rounded-full transition-all duration-500"
                    style={{ width: `${dept.percentage}%` }}
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
