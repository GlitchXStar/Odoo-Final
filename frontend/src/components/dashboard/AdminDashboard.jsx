import { useState, useEffect } from 'react';
import {
  Users, UserCheck, CalendarOff, DollarSign,
  TrendingUp, TrendingDown, Clock, AlertCircle
} from 'lucide-react';
import { dashboard } from '../../services/api.js';

const formatPayout = (val) => {
  const n = parseFloat(val) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const actionLabel = (action) => {
  const map = {
    USER_LOGIN: 'logged in',
    USER_LOGIN_OTP: 'logged in via OTP',
    ADMIN_REGISTERED: 'registered as admin',
    USER_CREATED: 'was created',
    PASSWORD_CHANGED: 'changed their password',
    LEAVE_APPLIED: 'applied for leave',
    LEAVE_APPROVED: 'had leave approved',
    LEAVE_REJECTED: 'had leave rejected',
    ATTENDANCE_CHECK_IN: 'checked in',
    ATTENDANCE_CHECK_OUT: 'checked out',
    PAYROLL_RUN: 'ran payroll',
  };
  return map[action] || action?.toLowerCase().replace(/_/g, ' ');
};

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? 's' : ''} ago`;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.first_name || user.firstName || 'there';

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, deptRes, actRes] = await Promise.all([
          dashboard.getStats(),
          dashboard.getDepartments(),
          dashboard.getActivity(),
        ]);
        setStats(statsRes?.data || statsRes || {});
        const depts = deptRes?.data ?? deptRes;
        setDepartments(Array.isArray(depts) ? depts : []);
        const acts = actRes?.data ?? actRes;
        setActivity(Array.isArray(acts) ? acts : []);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const emp = stats?.employees || {};
  const att = stats?.todayAttendance || {};
  const leaves = stats?.monthlyLeaves || {};
  const pay = stats?.payrollSummary || {};

  const statCards = [
    {
      label: 'Total Employees',
      value: emp.total_employees ?? '—',
      change: emp.active_employees ? `${emp.active_employees} active` : '—',
      trend: 'up', icon: Users, period: '',
    },
    {
      label: 'Present Today',
      value: att.present_today ?? '—',
      change: emp.total_employees ? `${Math.round((att.present_today / emp.total_employees) * 100) || 0}%` : '—',
      trend: 'up', icon: UserCheck, period: 'attendance rate',
    },
    {
      label: 'Pending Leaves',
      value: leaves.pending_leaves ?? '—',
      change: `${leaves.approved_leaves ?? 0} approved`,
      trend: 'neutral', icon: CalendarOff, period: 'this month',
    },
    {
      label: 'Payroll This Year',
      value: pay.total_payout ? formatPayout(pay.total_payout) : '—',
      change: pay.total_processed ? `${pay.total_processed} processed` : '—',
      trend: 'up', icon: DollarSign, period: '',
    },
  ];

  const maxDeptCount = departments.length > 0 ? Math.max(...departments.map(d => d.count)) : 1;

  if (loading) {
    return (
      <div className="max-w-content mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cal text-display-md text-ink">{greeting}, {firstName}</h1>
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
        {statCards.map((stat) => (
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
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-body-sm text-muted text-center">No recent activity.</p>
            ) : activity.slice(0, 5).map((item, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                    {item.first_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-body-sm text-ink">
                      <span className="font-medium">{item.first_name} {item.last_name}</span>{' '}
                      <span className="text-muted">{actionLabel(item.action)}</span>
                    </p>
                    <p className="text-caption text-muted">{timeAgo(item.timestamp)}</p>
                  </div>
                </div>
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
            {departments.length === 0 ? (
              <p className="text-body-sm text-muted text-center py-4">No department data.</p>
            ) : departments.map((dept) => (
              <div key={dept.department}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-body-sm text-ink">{dept.department}</span>
                  <span className="text-caption text-muted">{dept.count}</span>
                </div>
                <div className="w-full h-2 bg-surface-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((dept.count / maxDeptCount) * 100)}%` }}
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
