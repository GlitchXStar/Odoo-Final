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
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkError, setCheckError] = useState('');

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
        // attendance → { data: { attendance: [], pagination: {} } }
        setAttendanceData(Array.isArray(attRes?.data?.attendance) ? attRes.data.attendance : []);
        // leaves → { data: { leaves: [], pagination: {} } }
        setLeaveHistory(Array.isArray(leaveRes?.data?.leaves) ? leaveRes.data.leaves : []);
        // leaveBalances → { data: [] } flat array
        setBalances(Array.isArray(balRes?.data) ? balRes.data : []);
        // payroll → { data: [] } flat array
        setPayrollData(Array.isArray(payRes?.data) ? payRes.data : []);
      } catch (e) {
        console.error('Employee dashboard error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Determine today's attendance record
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
  const todayRecord = attendanceData.find(a => a.date?.startsWith(todayIso));
  const isCheckedIn = !!todayRecord?.check_in && !todayRecord?.check_out;
  const isCheckedOut = !!todayRecord?.check_out;

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    setCheckError('');
    try {
      const res = await attendance.checkIn();
      setAttendanceData(prev => {
        const exists = prev.findIndex(a => a.date?.startsWith(todayIso));
        if (exists >= 0) { const n = [...prev]; n[exists] = res.data; return n; }
        return [res.data, ...prev];
      });
    } catch (e) {
      setCheckError(e.message || 'Check-in failed');
    } finally { setCheckInLoading(false); }
  };

  const handleCheckOut = async () => {
    setCheckInLoading(true);
    setCheckError('');
    try {
      const res = await attendance.checkOut();
      setAttendanceData(prev => {
        const exists = prev.findIndex(a => a.date?.startsWith(todayIso));
        if (exists >= 0) { const n = [...prev]; n[exists] = res.data; return n; }
        return prev;
      });
    } catch (e) {
      setCheckError(e.message || 'Check-out failed');
    } finally { setCheckInLoading(false); }
  };

  // Build this week's attendance (Mon–Sun)
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
      time: rec?.check_in ? new Date(rec.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—',
    };
  });

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const thisMonthAtt = attendanceData.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
  });
  const presentDays = thisMonthAtt.filter(a => a.status === 'Present').length;
  const workingDays = thisMonthAtt.length;
  const totalLeaveBalance = balances.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);
  const totalLeaveAllocated = balances.reduce((sum, b) => sum + (Number(b.total_allocated) || 0), 0);
  const latestPayroll = payrollData[0] || {};

  const myStats = [
    { label: 'Present Days', value: presentDays, total: workingDays || '—', icon: CalendarCheck },
    { label: 'Leave Balance', value: totalLeaveBalance, total: totalLeaveAllocated || '—', icon: CalendarOff },
    { label: 'This Month Salary', value: latestPayroll.net_salary ? `₹${Number(latestPayroll.net_salary).toLocaleString('en-IN')}` : '—', total: null, icon: DollarSign },
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
        <div className="flex flex-col items-end gap-1">
          {isCheckedOut ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success text-body-sm font-medium">
              <Clock size={16} /> Checked out · {new Date(todayRecord.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          ) : isCheckedIn ? (
            <button
              onClick={handleCheckOut}
              disabled={checkInLoading}
              className="btn-primary inline-flex items-center gap-2 bg-error hover:bg-red-600 disabled:opacity-60"
            >
              {checkInLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Clock size={16} />}
              Check Out
            </button>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={checkInLoading}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {checkInLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Clock size={16} />}
              Check In
            </button>
          )}
          {checkError && <p className="text-caption text-error">{checkError}</p>}
        </div>
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
