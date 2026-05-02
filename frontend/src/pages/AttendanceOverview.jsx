import { useState, useEffect } from 'react';
import {
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, Download
} from 'lucide-react';
import { attendance } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

const months = ['January', 'February', 'March', 'April', 'May'];
const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

const statusBadge = {
  Present: 'badge-approved',
  Absent: 'badge-rejected',
  Leave: 'badge-pending',
  'Half-Day': 'badge-pending',
  Holiday: 'badge-approved',
};

const STATUSES = ['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday', 'Week-Off'];

export default function AttendanceOverview() {
  const { user } = useAuth();
  const roleName = (user?.role_name || user?.roleName || '').toLowerCase();
  const isHR = roleName === 'admin' || roleName === 'hr officer' || roleName === 'payroll officer';
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = selectedDate ? `?date=${selectedDate}` : '';
      const response = await attendance.getAll(params);
      const list = response?.data?.attendance ?? response?.data ?? response;
      setAttendanceData(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (rec, newStatus) => {
    if (newStatus === rec.status) return;
    setUpdating(rec.id);
    try {
      await attendance.update(rec.id, { status: newStatus });
      setAttendanceData((prev) =>
        prev.map((r) => r.id === rec.id ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const summaryCards = [
    { label: 'Present', value: attendanceData.filter(a => a.status === 'Present').length, color: 'text-success' },
    { label: 'Absent', value: attendanceData.filter(a => a.status === 'Absent').length, color: 'text-error' },
    { label: 'On Leave', value: attendanceData.filter(a => a.status === 'Leave').length, color: 'text-[#8b5cf6]' },
    { label: 'Half Day', value: attendanceData.filter(a => a.status === 'Half-Day').length, color: 'text-warning' },
  ];

  const filtered = attendanceData.filter((rec) => {
    const fullName = `${rec.first_name || ''} ${rec.last_name || ''}`.toLowerCase();
    const matchSearch = !search || fullName.includes(search.toLowerCase()) || rec.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || rec.department === deptFilter;
    return matchSearch && matchDept;
  });

  const fmtTime = (t) => {
    if (!t) return '—';
    try {
      const d = new Date(t);
      if (isNaN(d)) return '—';
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Attendance</h1>
          <p className="text-body-sm text-muted mt-1">
            Track and manage employee attendance across departments.
          </p>
        </div>
        <button className="btn-secondary inline-flex items-center gap-2">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-canvas border border-hairline rounded-lg p-4 text-center">
            <p className={`text-display-sm font-cal ${card.color}`}>{card.value}</p>
            <p className="text-caption text-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-canvas border border-hairline rounded-lg mb-6">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-surface-soft rounded-md px-3 py-2">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-body-sm text-ink placeholder:text-muted w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field py-1.5 w-auto text-body-sm"
            />
          </div>
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input-field py-1.5 pr-8 text-body-sm appearance-none cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Employee</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Department</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Check In</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Check Out</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Hours</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Status</th>
                {isHR && <th className="text-left px-5 py-3 text-caption text-muted font-medium">Override</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isHR ? 7 : 6} className="px-5 py-10 text-center text-body-sm text-muted">No attendance records found.</td>
                </tr>
              ) : filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                        {`${rec.first_name?.[0] || ''}${rec.last_name?.[0] || ''}`}
                      </div>
                      <span className="text-body-sm font-medium text-ink">{rec.first_name} {rec.last_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{rec.department || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm ${!rec.check_in ? 'text-muted' : 'text-ink'}`}>
                      {fmtTime(rec.check_in)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm ${!rec.check_out ? 'text-muted' : 'text-ink'}`}>
                      {fmtTime(rec.check_out)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm font-medium ${!rec.work_hours ? 'text-muted' : 'text-ink'}`}>
                      {rec.work_hours ? `${Number(rec.work_hours).toFixed(1)}h` : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusBadge[rec.status] || 'badge-pending'}`}>
                      {rec.status || '—'}
                    </span>
                  </td>
                  {isHR && (
                    <td className="px-5 py-3.5">
                      <div className="relative">
                        <select
                          value={rec.status || ''}
                          onChange={(e) => handleStatusChange(rec, e.target.value)}
                          disabled={updating === rec.id}
                          className="input-field py-1 pr-7 text-caption appearance-none cursor-pointer w-32"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-hairline">
          <span className="text-caption text-muted">
            Showing {filtered.length} of {attendanceData.length} records
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronLeft size={16} />
            </button>
            <button className="px-2.5 py-1 text-caption font-medium bg-ink text-on-primary rounded-md">1</button>
            <button className="p-1.5 text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
