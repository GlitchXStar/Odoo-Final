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

export default function MyAttendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendance.getAll();
      const raw = response?.data?.attendance ?? response?.data ?? response;
      const logs = Array.isArray(raw) ? raw : [];
      setRecentLogs(logs);
      
      // Calculate today's status
      const today = new Date().toISOString().split('T')[0];
      const todayLog = logs.find(l => l.date === today);
      if (todayLog) {
        setIsCheckedIn(todayLog.check_out_time ? false : !!todayLog.check_in_time);
        setTodayStatus(todayLog);
      }
      
      // Calculate monthly summary
      setMonthlySummary({
        present: logs.filter(l => l.status === 'present').length,
        absent: logs.filter(l => l.status === 'absent').length,
        halfDay: logs.filter(l => l.status === 'halfday').length,
        leave: logs.filter(l => l.status === 'leave').length,
        totalWorking: logs.length,
      });
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendance.checkIn();
      setIsCheckedIn(true);
      fetchAttendance();
    } catch (err) {
      setError(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendance.checkOut();
      setIsCheckedIn(false);
      fetchAttendance();
    } catch (err) {
      setError(err.message || 'Check-out failed');
    }
  };

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
          <p className="text-caption text-muted mb-1">{todayStatus.date}</p>
          <div className="w-20 h-20 rounded-full bg-surface-card flex items-center justify-center my-4">
            <Clock size={32} className="text-ink" />
          </div>
          {isCheckedIn ? (
            <>
              <p className="text-body-sm text-muted">
                Checked in at <span className="font-medium text-ink">{todayStatus.checkInTime}</span>
              </p>
              <button
                onClick={() => setIsCheckedIn(false)}
                className="mt-4 btn-primary inline-flex items-center gap-2 bg-error hover:bg-red-600"
              >
                <LogOut size={16} />
                Check Out
              </button>
            </>
          ) : (
            <>
              <p className="text-body-sm text-muted">You haven't checked in yet.</p>
              <button
                onClick={() => setIsCheckedIn(true)}
                className="mt-4 btn-primary inline-flex items-center gap-2 bg-success hover:bg-emerald-600"
              >
                <LogIn size={16} />
                Check In
              </button>
            </>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-title-sm text-ink">Monthly Summary — May 2026</h3>
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
                {Math.round((monthlySummary.present / monthlySummary.totalWorking) * 100)}%
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
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-caption text-muted">May 2026</span>
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
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
              {recentLogs.map((log, i) => (
                <tr key={i} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{log.date}</td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{log.day}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm ${log.checkIn === '—' ? 'text-muted' : 'text-ink'}`}>
                      {log.checkIn}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm ${log.checkOut === '—' ? 'text-muted' : 'text-ink'}`}>
                      {log.checkOut}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm font-medium ${log.hours === '—' ? 'text-muted' : 'text-ink'}`}>
                      {log.hours}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusBadge[log.status]}`}>
                      {statusLabel[log.status]}
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
