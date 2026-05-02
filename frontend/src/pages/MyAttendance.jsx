import { useState, useEffect } from 'react';
import {
  Clock, LogIn, LogOut, CalendarDays, CalendarCheck,
  ChevronLeft, ChevronRight, ArrowRight
} from 'lucide-react';
import { attendance } from '../services/api.js';


const statusBadge = {
  present: 'badge-present',
  absent: 'badge-absent',
  halfday: 'badge-halfday',
  leave: 'badge-leave',
};

const statusLabel = {
  present: 'Present',
  absent: 'Absent',
  halfday: 'Half Day',
  leave: 'Leave',
};

function toLocalDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(ts) {
  if (!ts) return '—';
  const [y, m, d] = toLocalDate(ts).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDay(ts) {
  if (!ts) return '—';
  const [y, m, d] = toLocalDate(ts).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short' });
}

export default function MyAttendance() {
  const [todayRecord, setTodayRecord] = useState(null);
  const [allLogs, setAllLogs] = useState([]);
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date(); return { month: n.getMonth() + 1, year: n.getFullYear() };
  });
  const [loading, setLoading] = useState(true);
  const [checkLoading, setCheckLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendance.getAll();
      const logs = Array.isArray(response?.data?.attendance) ? response.data.attendance : [];
      const todayIso = toLocalDate(new Date());
      const rec = logs.find(l => l.date && toLocalDate(l.date) === todayIso);
      setAllLogs(logs);
      setTodayRecord(rec || null);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckLoading(true); setError('');
    try { await attendance.checkIn(); await fetchAttendance(); }
    catch (err) { setError(err.message || 'Check-in failed'); }
    finally { setCheckLoading(false); }
  };

  const handleCheckOut = async () => {
    setCheckLoading(true); setError('');
    try { await attendance.checkOut(); await fetchAttendance(); }
    catch (err) { setError(err.message || 'Check-out failed'); }
    finally { setCheckLoading(false); }
  };

  const isCheckedIn  = !!todayRecord?.check_in && !todayRecord?.check_out;
  const isCheckedOut = !!todayRecord?.check_out;

  // Filter logs for view month
  const monthLogs = allLogs.filter(l => {
    const ld = toLocalDate(l.date);
    const [y, m] = ld.split('-').map(Number);
    return m === viewMonth.month && y === viewMonth.year;
  });

  const monthlySummary = {
    present:      monthLogs.filter(l => l.status === 'Present').length,
    absent:       monthLogs.filter(l => l.status === 'Absent').length,
    halfDay:      monthLogs.filter(l => l.status === 'Half-Day').length,
    leave:        monthLogs.filter(l => l.status === 'Leave').length,
    totalWorking: monthLogs.length,
  };

  const monthLabel = new Date(viewMonth.year, viewMonth.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const prevMonth = () => setViewMonth(p => {
    const d = new Date(p.year, p.month - 2); return { month: d.getMonth() + 1, year: d.getFullYear() };
  });
  const nextMonth = () => setViewMonth(p => {
    const d = new Date(p.year, p.month); return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  if (loading) {
    return (
      <div className="max-w-content mx-auto flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-content mx-auto">
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-body-sm text-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cal text-display-md text-ink">My Attendance</h1>
        <p className="text-body-sm text-muted mt-1">
          Track your daily attendance and view your monthly summary.
        </p>
      </div>

      {/* Today's Status + Check In/Out */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Check In / Out Card */}
        <div className="bg-canvas border border-hairline rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <p className="text-caption text-muted mb-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center my-4">
            <Clock size={32} className="text-ink" />
          </div>
          {isCheckedOut ? (
            <p className="text-body-sm text-success font-medium">
              Checked out at {fmtTime(todayRecord.check_out)}
            </p>
          ) : isCheckedIn ? (
            <>
              <p className="text-body-sm text-muted">
                Checked in at <span className="font-medium text-ink">{fmtTime(todayRecord.check_in)}</span>
              </p>
              <button
                onClick={handleCheckOut}
                disabled={checkLoading}
                className="mt-4 btn-primary inline-flex items-center gap-2 bg-error hover:bg-red-600 disabled:opacity-60"
              >
                {checkLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut size={16} />}
                Check Out
              </button>
            </>
          ) : (
            <>
              <p className="text-body-sm text-muted">You haven't checked in yet.</p>
              <button
                onClick={handleCheckIn}
                disabled={checkLoading}
                className="mt-4 btn-primary inline-flex items-center gap-2 bg-success hover:bg-emerald-600 disabled:opacity-60"
              >
                {checkLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
                Check In
              </button>
            </>
          )}
          {error && <p className="text-caption text-error mt-2">{error}</p>}
        </div>

        {/* Monthly Summary */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title-sm text-ink">Monthly Summary — {monthLabel}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Present', value: monthlySummary.present, color: 'text-success', bg: 'bg-status-present-bg' },
              { label: 'Absent', value: monthlySummary.absent, color: 'text-error', bg: 'bg-status-absent-bg' },
              { label: 'Half Day', value: monthlySummary.halfDay, color: 'text-warning', bg: 'bg-status-halfday-bg' },
              { label: 'On Leave', value: monthlySummary.leave, color: 'text-[#8b5cf6]', bg: 'bg-status-leave-bg' },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-lg p-4 text-center`}>
                <p className={`text-display-sm font-cal ${item.color}`}>{item.value}</p>
                <p className="text-caption text-muted mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-between">
            <span className="text-body-sm text-muted">
              Total Working Days: <span className="font-medium text-ink">{monthlySummary.totalWorking}</span>
            </span>
            <span className="text-body-sm text-muted">
              Attendance Rate:{' '}
              <span className="font-medium text-success">
                {monthlySummary.totalWorking > 0 ? Math.round((monthlySummary.present / monthlySummary.totalWorking) * 100) : 0}%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Log */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
          <h3 className="text-title-sm text-ink">Attendance Log</h3>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-caption text-muted">{monthLabel}</span>
            <button onClick={nextMonth} className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Date</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Day</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Check In</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Check Out</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Hours</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {monthLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-body-sm text-muted">No attendance records for this month.</td></tr>
              ) : monthLogs.map((log, i) => (
                <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{fmtDate(log.date)}</td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{fmtDay(log.date)}</td>
                  <td className="px-5 py-3.5 text-body-sm text-ink">{fmtTime(log.check_in)}</td>
                  <td className="px-5 py-3.5 text-body-sm text-ink">{fmtTime(log.check_out)}</td>
                  <td className="px-5 py-3.5 text-body-sm font-medium text-ink">
                    {log.work_hours ? `${log.work_hours}h` : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge badge-${(log.status || '').toLowerCase().replace('-', '')}`}>
                      {log.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
