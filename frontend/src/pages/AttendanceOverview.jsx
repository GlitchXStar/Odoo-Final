import { useState } from 'react';
import {
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, Download, Clock
} from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May'];
const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

const attendanceData = [
  { id: 1, name: 'Priya Sharma', dept: 'Engineering', date: '2026-05-02', checkIn: '09:02 AM', checkOut: '06:15 PM', hours: '9h 13m', status: 'present' },
  { id: 2, name: 'Rajesh Kumar', dept: 'Engineering', date: '2026-05-02', checkIn: '08:55 AM', checkOut: '06:30 PM', hours: '9h 35m', status: 'present' },
  { id: 3, name: 'Anjali Patel', dept: 'Marketing', date: '2026-05-02', checkIn: '—', checkOut: '—', hours: '—', status: 'absent' },
  { id: 4, name: 'Vikram Singh', dept: 'Sales', date: '2026-05-02', checkIn: '—', checkOut: '—', hours: '—', status: 'leave' },
  { id: 5, name: 'Sneha Desai', dept: 'HR', date: '2026-05-02', checkIn: '09:10 AM', checkOut: '06:00 PM', hours: '8h 50m', status: 'present' },
  { id: 6, name: 'Amit Verma', dept: 'Finance', date: '2026-05-02', checkIn: '01:15 PM', checkOut: '06:00 PM', hours: '4h 45m', status: 'halfday' },
  { id: 7, name: 'Kavita Joshi', dept: 'Operations', date: '2026-05-02', checkIn: '09:00 AM', checkOut: '06:20 PM', hours: '9h 20m', status: 'present' },
  { id: 8, name: 'Arjun Mehta', dept: 'Engineering', date: '2026-05-02', checkIn: '08:48 AM', checkOut: '05:50 PM', hours: '9h 02m', status: 'present' },
  { id: 9, name: 'Rahul Nair', dept: 'Sales', date: '2026-05-02', checkIn: '09:30 AM', checkOut: '06:45 PM', hours: '9h 15m', status: 'present' },
  { id: 10, name: 'Meera Iyer', dept: 'Engineering', date: '2026-05-02', checkIn: '—', checkOut: '—', hours: '—', status: 'absent' },
];

const statusBadge = {
  present: 'badge-present',
  absent: 'badge-absent',
  leave: 'badge-leave',
  halfday: 'badge-halfday',
};

const statusLabel = {
  present: 'Present',
  absent: 'Absent',
  leave: 'On Leave',
  halfday: 'Half Day',
};

const summaryCards = [
  { label: 'Present', value: 6, color: 'text-success' },
  { label: 'Absent', value: 2, color: 'text-error' },
  { label: 'On Leave', value: 1, color: 'text-[#8b5cf6]' },
  { label: 'Half Day', value: 1, color: 'text-warning' },
];

export default function AttendanceOverview() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-05-02');

  const filtered = attendanceData.filter((emp) => {
    const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || emp.dept === deptFilter;
    return matchSearch && matchDept;
  });

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
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-body-sm font-medium text-ink">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{emp.dept}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm ${emp.checkIn === '—' ? 'text-muted' : 'text-ink'}`}>
                      {emp.checkIn}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm ${emp.checkOut === '—' ? 'text-muted' : 'text-ink'}`}>
                      {emp.checkOut}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm font-medium ${emp.hours === '—' ? 'text-muted' : 'text-ink'}`}>
                      {emp.hours}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusBadge[emp.status]}`}>
                      {statusLabel[emp.status]}
                    </span>
                  </td>
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
