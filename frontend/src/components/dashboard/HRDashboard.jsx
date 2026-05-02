import { useState, useEffect } from 'react';
import {
  Users, UserCheck, CalendarOff, AlertCircle,
  TrendingUp, ArrowRight, Clock
} from 'lucide-react';
import { dashboard, leaves, employees } from '../../services/api.js';

export default function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [recentJoiners, setRecentJoiners] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.first_name || user.firstName || 'there';

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, leavesRes, empRes] = await Promise.all([
          dashboard.getStats(),
          leaves.getAll(),
          employees.getAll(),
        ]);
        setStats(statsRes?.data || statsRes || {});
        const leavesRaw = leavesRes?.data?.leaves ?? leavesRes?.data ?? leavesRes;
        const allLeaves = Array.isArray(leavesRaw) ? leavesRaw : [];
        setPendingLeaves(allLeaves.filter(l => l.status === 'Pending').slice(0, 5));
        const empRaw = empRes?.data?.employees ?? empRes?.data ?? empRes;
        const allEmp = Array.isArray(empRaw) ? empRaw : [];
        const sorted = [...allEmp].sort((a, b) => new Date(b.date_of_joining) - new Date(a.date_of_joining));
        setRecentJoiners(sorted.slice(0, 5));
      } catch (e) {
        console.error('HR Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const emp = stats?.employees || {};
  const att = stats?.todayAttendance || {};
  const leaveStats = stats?.monthlyLeaves || {};

  const hrStats = [
    { label: 'Total Employees', value: emp.total_employees ?? '—', change: `${emp.active_employees ?? 0} active`, trend: 'up', icon: Users },
    { label: 'Active Today', value: att.present_today ?? '—', change: emp.total_employees ? `${Math.round((att.present_today / emp.total_employees) * 100) || 0}% attendance` : '—', trend: 'up', icon: UserCheck },
    { label: 'Pending Leaves', value: leaveStats.pending_leaves ?? '—', change: 'needs approval', trend: 'alert', icon: CalendarOff },
    { label: 'New Joiners', value: recentJoiners.length, change: 'recent', trend: 'up', icon: AlertCircle },
  ];

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
          <h1 className="font-cal text-display-md text-ink">{greeting}, {firstName}</h1>
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
            {pendingLeaves.length === 0 ? (
              <p className="px-5 py-8 text-body-sm text-muted text-center">No pending leave requests.</p>
            ) : pendingLeaves.map((leave, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                    {(leave.employee_name || leave.first_name || '?').charAt(0)}
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-ink">{leave.employee_name || `${leave.first_name || ''} ${leave.last_name || ''}`}</p>
                    <p className="text-caption text-muted">
                      {leave.leave_type_name || leave.type} · {leave.start_date ? new Date(leave.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''} — {leave.end_date ? new Date(leave.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''} · {leave.total_days ?? leave.days ?? 1} day{(leave.total_days ?? leave.days ?? 1) > 1 ? 's' : ''}
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
            {recentJoiners.length === 0 ? (
              <p className="px-5 py-8 text-body-sm text-muted text-center">No recent joiners.</p>
            ) : recentJoiners.map((joiner, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-card flex items-center justify-center text-body-sm font-medium text-ink">
                  {(joiner.first_name || joiner.name || '?').charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm font-medium text-ink">{joiner.first_name} {joiner.last_name}</p>
                  <p className="text-caption text-muted">{joiner.department}</p>
                </div>
                <span className="text-caption text-muted">{joiner.date_of_joining ? new Date(joiner.date_of_joining).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}</span>
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
