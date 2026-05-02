import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, Download, Plus, ArrowRight
} from 'lucide-react';

const leaveRecords = [
  { id: 1, employee: 'Priya Sharma', type: 'Casual Leave', from: '2026-05-05', to: '2026-05-06', days: 2, status: 'pending', appliedOn: '2026-05-01' },
  { id: 2, employee: 'Vikram Singh', type: 'Sick Leave', from: '2026-05-02', to: '2026-05-02', days: 1, status: 'approved', appliedOn: '2026-05-01' },
  { id: 3, employee: 'Anjali Patel', type: 'Paid Leave', from: '2026-05-10', to: '2026-05-12', days: 3, status: 'pending', appliedOn: '2026-04-30' },
  { id: 4, employee: 'Sneha Desai', type: 'Casual Leave', from: '2026-04-28', to: '2026-04-29', days: 2, status: 'approved', appliedOn: '2026-04-25' },
  { id: 5, employee: 'Amit Verma', type: 'Sick Leave', from: '2026-04-22', to: '2026-04-22', days: 1, status: 'rejected', appliedOn: '2026-04-20' },
  { id: 6, employee: 'Kavita Joshi', type: 'Unpaid Leave', from: '2026-04-15', to: '2026-04-18', days: 4, status: 'approved', appliedOn: '2026-04-10' },
  { id: 7, employee: 'Arjun Mehta', type: 'Casual Leave', from: '2026-05-15', to: '2026-05-16', days: 2, status: 'pending', appliedOn: '2026-05-02' },
  { id: 8, employee: 'Rahul Nair', type: 'Paid Leave', from: '2026-04-01', to: '2026-04-03', days: 3, status: 'approved', appliedOn: '2026-03-28' },
];

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
const statusLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
const leaveTypes = ['All', 'Casual Leave', 'Sick Leave', 'Paid Leave', 'Unpaid Leave'];
const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'];

const summaryCards = [
  { label: 'Total Requests', value: leaveRecords.length, color: 'text-ink' },
  { label: 'Pending', value: leaveRecords.filter((l) => l.status === 'pending').length, color: 'text-warning' },
  { label: 'Approved', value: leaveRecords.filter((l) => l.status === 'approved').length, color: 'text-success' },
  { label: 'Rejected', value: leaveRecords.filter((l) => l.status === 'rejected').length, color: 'text-error' },
];

export default function TimeOffOverview() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = leaveRecords.filter((rec) => {
    const matchSearch = rec.employee.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || rec.type === typeFilter;
    const matchStatus = statusFilter === 'All' || statusLabel[rec.status] === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="max-w-content mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">Time Off</h1>
          <p className="text-body-sm text-muted mt-1">
            Manage leave requests across the organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/time-off/approvals" className="btn-secondary inline-flex items-center gap-2">
            Approvals
            <ArrowRight size={14} />
          </Link>
          <button className="btn-secondary inline-flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
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
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field py-1.5 pr-8 text-body-sm appearance-none cursor-pointer"
            >
              {leaveTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field py-1.5 pr-8 text-body-sm appearance-none cursor-pointer"
            >
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
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
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Leave Type</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">From</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">To</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Days</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Status</th>
                <th className="text-left px-5 py-3 text-caption text-muted font-medium">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-soft/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-caption font-medium text-ink">
                        {rec.employee.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-body-sm font-medium text-ink">{rec.employee}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-ink">{rec.type}</td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">
                    {new Date(rec.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">
                    {new Date(rec.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{rec.days}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusBadge[rec.status]}`}>{statusLabel[rec.status]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">
                    {new Date(rec.appliedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
