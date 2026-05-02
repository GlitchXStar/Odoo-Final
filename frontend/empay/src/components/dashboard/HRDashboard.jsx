import {
  Users, UserCheck, CalendarOff, AlertCircle,
  TrendingUp, ArrowRight, Clock
} from 'lucide-react';

const hrStats = [
  { label: 'Total Employees', value: '1,248', change: '+12 this month', trend: 'up', icon: Users },
  { label: 'Active Today', value: '1,089', change: '87% attendance', trend: 'up', icon: UserCheck },
  { label: 'Pending Leaves', value: '7', change: 'needs approval', trend: 'alert', icon: CalendarOff },
  { label: 'New Joiners', value: '5', change: 'this month', trend: 'up', icon: AlertCircle },
];

const pendingLeaves = [
  { employee: 'Priya Sharma', type: 'Casual Leave', from: 'May 5', to: 'May 6', days: 2 },
  { employee: 'Amit Verma', type: 'Sick Leave', from: 'May 3', to: 'May 3', days: 1 },
  { employee: 'Sneha Desai', type: 'Casual Leave', from: 'May 7', to: 'May 9', days: 3 },
  { employee: 'Vikram Singh', type: 'Paid Leave', from: 'May 10', to: 'May 12', days: 3 },
];

const recentJoiners = [
  { name: 'Arjun Mehta', department: 'Engineering', joined: 'Apr 28' },
  { name: 'Kavita Joshi', department: 'Marketing', joined: 'Apr 25' },
  { name: 'Rahul Nair', department: 'Sales', joined: 'Apr 22' },
];

export default function HRDashboard() {
  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cal text-display-md text-ink">HR Dashboard</h1>
          <p className="text-body-sm text-muted mt-1">
            Manage your workforce, handle leave requests, and track employee activity.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-pill text-caption text-muted">
          <Clock size={14} />
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {hrStats.map((stat) => (
          <div key={stat.label} className="bg-canvas border border-hairline rounded-lg p-5 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted">{stat.label}</span>
              <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center">
                <stat.icon size={18} className="text-muted" />
              </div>
            </div>
            <p className="text-title-lg text-ink">{stat.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {stat.trend === 'up' && <TrendingUp size={14} className="text-success" />}
              {stat.trend === 'alert' && <AlertCircle size={14} className="text-warning" />}
              <span className={`text-caption ${stat.trend === 'alert' ? 'text-warning' : 'text-success'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pending Leave Approvals */}
        <div className="lg:col-span-3 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-title-sm text-ink">Pending Leave Approvals</h3>
              <span className="badge badge-pending">{pendingLeaves.length}</span>
            </div>
            <a href="/app/time-off/approvals" className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
              View all
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="divide-y divide-hairline">
            {pendingLeaves.map((leave, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                    {leave.employee.charAt(0)}
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-ink">{leave.employee}</p>
                    <p className="text-caption text-muted">
                      {leave.type} · {leave.from} — {leave.to} · {leave.days} day{leave.days > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-caption font-medium bg-ink text-on-primary rounded-md hover:bg-[#242424] transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1.5 text-caption font-medium text-muted border border-hairline rounded-md hover:text-error hover:border-error/30 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Joiners */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline">
            <h3 className="text-title-sm text-ink">Recent Joiners</h3>
          </div>
          <div className="divide-y divide-hairline">
            {recentJoiners.map((joiner, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center text-body-sm font-medium text-ink">
                  {joiner.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm font-medium text-ink">{joiner.name}</p>
                  <p className="text-caption text-muted">{joiner.department}</p>
                </div>
                <span className="text-caption text-muted">{joiner.joined}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-hairline">
            <a href="/app/employees" className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
              View all employees
              <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
