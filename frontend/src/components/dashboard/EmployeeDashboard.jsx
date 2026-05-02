import { useState, useEffect } from 'react';
import {
  Clock, CalendarOff, DollarSign, FileText,
  ArrowRight, CalendarCheck, CalendarDays
} from 'lucide-react';
import { attendance, leaves, leaveBalances, payroll } from '../../services/api.js';

const statusColors = {
  Present: 'bg-success',
  Absent: 'bg-surface-strong',
  'Half-Day': 'bg-warning',
  Leave: 'bg-warning',
  Holiday: 'bg-surface-card',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmployeeDashboard() {
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';

  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [balances, setBalances] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.first_name || user.firstName || 'there';

  useEffect(() => {
    (async () => {
      try {
        const [attRes, leaveRes, balRes, payRes] = await Promise.all([
          attendance.getAll(),
          leaves.getAll(),
          leaveBalances.getAll(),
          payroll.getAll(),
        ]);
        const attRaw = attRes?.data?.attendance ?? attRes?.data ?? attRes;
        setAttendanceData(Array.isArray(attRaw) ? attRaw : []);
        const leaveRaw = leaveRes?.data?.leaves ?? leaveRes?.data ?? leaveRes;
        setLeaveHistory(Array.isArray(leaveRaw) ? leaveRaw : []);
        const balRaw = balRes?.data ?? balRes;
        setBalances(Array.isArray(balRaw) ? balRaw : []);
        const payRaw = payRes?.data ?? payRes;
        setPayrollData(Array.isArray(payRaw) ? payRaw : []);
      } catch (e) {
        console.error('Employee dashboard error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build this week's attendance (Mon–Sun)
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
  const attendanceWeek = weekDays.map((d) => {
    const iso = d.toISOString().split('T')[0];
    const rec = attendanceData.find(a => a.date?.startsWith(iso));
    const st = rec?.status || (d > today ? null : 'Absent');
    return {
      day: DAY_LABELS[d.getDay()],
      status: st,
      time: rec?.check_in ? new Date(`1970-01-01T${rec.check_in}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
    };
  });

  const presentDays = attendanceData.filter(a => a.status === 'Present').length;
  const totalLeaveBalance = balances.reduce((sum, b) => sum + (b.balance || 0), 0);
  const totalLeaveAllocated = balances.reduce((sum, b) => sum + (b.allocated || b.total || 0), 0);
  const latestPayroll = payrollData[0] || {};

  const myStats = [
    { label: 'Present Days', value: presentDays, total: attendanceData.length || '—', icon: CalendarCheck },
    { label: 'Leave Balance', value: totalLeaveBalance, total: totalLeaveAllocated || '—', icon: CalendarOff },
    { label: 'This Month Salary', value: latestPayroll.net_salary ? `₹${Number(latestPayroll.net_salary).toLocaleString('en-IN')}` : '—', icon: DollarSign },
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
      {/* Greeting Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cal text-display-md text-ink">{greeting}, {firstName}</h1>
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[day.status] || 'bg-surface-card'}`}
                  >
                    {day.status === 'Present' && <CalendarCheck size={14} className="text-white" />}
                    {(day.status === 'Half-Day' || day.status === 'Leave') && <Clock size={14} className="text-white" />}
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
            {leaveHistory.length === 0 ? (
              <p className="px-5 py-8 text-body-sm text-muted text-center">No leave history.</p>
            ) : leaveHistory.slice(0, 4).map((leave, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-medium text-ink">{leave.leave_type_name || leave.type}</p>
                  <p className="text-caption text-muted">
                    {leave.start_date ? new Date(leave.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''} — {leave.end_date ? new Date(leave.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''} · {leave.total_days ?? leave.days ?? 1} day{(leave.total_days ?? leave.days ?? 1) > 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`badge badge-${(leave.status || '').toLowerCase()}`}>
                  {leave.status}
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
