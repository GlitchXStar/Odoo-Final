import {
  Clock, CalendarOff, DollarSign, FileText,
  ArrowRight, CalendarCheck, CalendarDays
} from 'lucide-react';

const myStats = [
  { label: 'Present Days', value: '22', total: '25', icon: CalendarCheck },
  { label: 'Leave Balance', value: '8', total: '15', icon: CalendarOff },
  { label: 'This Month Salary', value: '₹57,600', icon: DollarSign },
];

const attendanceWeek = [
  { day: 'Mon', status: 'present', time: '09:02 AM' },
  { day: 'Tue', status: 'present', time: '08:55 AM' },
  { day: 'Wed', status: 'present', time: '09:10 AM' },
  { day: 'Thu', status: 'halfday', time: '01:15 PM' },
  { day: 'Fri', status: 'present', time: '08:48 AM' },
  { day: 'Sat', status: 'absent', time: '—' },
  { day: 'Sun', status: 'absent', time: '—' },
];

const leaveHistory = [
  { type: 'Casual Leave', from: 'Apr 15', to: 'Apr 16', status: 'approved', days: 2 },
  { type: 'Sick Leave', from: 'Mar 22', to: 'Mar 22', status: 'approved', days: 1 },
  { type: 'Casual Leave', from: 'Feb 10', to: 'Feb 12', status: 'approved', days: 3 },
];

const statusColors = {
  present: 'bg-success',
  absent: 'bg-surface-strong',
  halfday: 'bg-warning',
};

export default function EmployeeDashboard() {
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-content mx-auto">
      {/* Greeting Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cal text-display-md text-ink">{greeting}, Rajesh</h1>
          <p className="text-body-sm text-muted mt-1">
            Here's a summary of your work status this month.
          </p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2">
          <Clock size={16} />
          Check In
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {myStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-canvas border border-hairline rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted">{stat.label}</span>
              <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center">
                <stat.icon size={18} className="text-muted" />
              </div>
            </div>
            <p className="text-title-lg text-ink">
              {stat.value}
              {stat.total && (
                <span className="text-body-sm text-muted font-normal"> / {stat.total}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week's Attendance */}
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <h3 className="text-title-sm text-ink">This Week</h3>
            <a href="/app/attendance/me" className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
              View all
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3">
              {attendanceWeek.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-caption text-muted">{day.day}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[day.status]}`}
                  >
                    {day.status === 'present' && <CalendarCheck size={14} className="text-white" />}
                    {day.status === 'halfday' && <Clock size={14} className="text-white" />}
                  </div>
                  <span className="text-[11px] text-muted">{day.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leave History */}
        <div className="bg-canvas border border-hairline rounded-lg">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <h3 className="text-title-sm text-ink">Recent Leaves</h3>
            <a href="/app/time-off/me" className="text-caption text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
              Apply for leave
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="divide-y divide-hairline">
            {leaveHistory.map((leave, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-medium text-ink">{leave.type}</p>
                  <p className="text-caption text-muted">
                    {leave.from} — {leave.to} · {leave.days} day{leave.days > 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`badge badge-${leave.status}`}>
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CalendarDays, label: 'View Attendance', desc: 'Check your attendance logs', to: '/app/attendance/me' },
          { icon: CalendarOff, label: 'Apply for Leave', desc: 'Submit a leave request', to: '/app/time-off/apply' },
          { icon: FileText, label: 'View Payslip', desc: 'Download latest payslip', to: '/app/payroll/my-payslip' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.to}
            className="bg-canvas border border-hairline rounded-lg p-5 hover:border-ink/20 hover:shadow-soft transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center mb-3 group-hover:bg-ink group-hover:text-on-primary transition-all">
              <action.icon size={20} />
            </div>
            <h4 className="text-title-sm text-ink">{action.label}</h4>
            <p className="text-caption text-muted mt-0.5">{action.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
