import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, Download, Plus, ArrowRight
} from 'lucide-react';
import { leaves } from '../services/api.js';

const statusBadge = { Pending: 'badge-pending', Approved: 'badge-approved', Rejected: 'badge-rejected' };
const leaveTypes = ['All', 'Annual Leave', 'Casual Leave', 'Sick Leave', 'Unpaid Leave', 'Maternity Leave', 'Paternity Leave'];
const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'];

export default function TimeOffOverview() {
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaves.getAll();
      const raw = response?.data?.leaves ?? response?.data ?? response;
      setLeaveRecords(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message || 'Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    { label: 'Total Requests', value: leaveRecords.length, color: 'text-ink' },
    { label: 'Pending', value: leaveRecords.filter((l) => l.status === 'Pending').length, color: 'text-warning' },
    { label: 'Approved', value: leaveRecords.filter((l) => l.status === 'Approved').length, color: 'text-success' },
    { label: 'Rejected', value: leaveRecords.filter((l) => l.status === 'Rejected').length, color: 'text-error' },
  ];

  const filtered = leaveRecords.filter((rec) => {
    const fullName = `${rec.first_name || ''} ${rec.last_name || ''}`.toLowerCase();
    const matchSearch = !search || fullName.includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || rec.leave_type_name === typeFilter;
    const matchStatus = statusFilter === 'All' || rec.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-body-sm text-muted">No leave records found.</td>
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
                  <td className="px-5 py-3.5 text-body-sm text-ink">{rec.leave_type_name || '—'}</td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{fmtDate(rec.start_date)}</td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{fmtDate(rec.end_date)}</td>
                  <td className="px-5 py-3.5 text-body-sm font-medium text-ink">{rec.total_days ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusBadge[rec.status] || 'badge-pending'}`}>{rec.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-muted">{fmtDate(rec.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
