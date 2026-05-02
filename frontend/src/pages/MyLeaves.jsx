import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarOff, Plus, ArrowRight, Calendar, Filter
} from 'lucide-react';
import { leaves, leaveBalances } from '../services/api.js';

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-rejected' };
const statusLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled' };
const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

export default function MyLeaves() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const [leavesRes, balancesRes] = await Promise.all([
        leaves.getMine(),
        leaveBalances.getAll()
      ]);
      const leavesData = leavesRes?.data?.leaves ?? leavesRes?.data ?? [];
      setMyLeaves(Array.isArray(leavesData) ? leavesData : []);
      const balData = Array.isArray(balancesRes?.data) ? balancesRes.data : [];
      const currentYear = new Date().getFullYear();
      setLeaveBalance(balData.filter(b => !b.year || b.year === currentYear));
    } catch (err) {
      setError(err.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cal text-display-md text-ink">My Leaves</h1>
          <p className="text-body-sm text-muted mt-1">
            View your leave history and apply for new time off.
          </p>
        </div>
        <Link to="/app/time-off/apply" className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} />
          Apply for Leave
        </Link>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {leaveBalance.length === 0 ? (
          <div className="col-span-full bg-surface-card border border-hairline rounded-lg p-6 text-center">
            <p className="text-body-sm text-muted">No leave balance allocated. Contact your HR/Admin.</p>
          </div>
        ) : leaveBalance.map((bal) => {
          const total = Number(bal.total_allocated) || 0;
          const used = Number(bal.used) || 0;
          const remaining = Number(bal.balance) || 0;
          const usedPercent = total > 0 ? (used / total) * 100 : 0;
          return (
            <div key={bal.id} className="bg-canvas border border-hairline rounded-lg p-5">
              <p className="text-caption text-muted mb-3">{bal.leave_type_name || 'Leave'}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-title-lg text-ink">{remaining}</p>
                  <p className="text-caption text-muted">remaining</p>
                </div>
                <div className="text-right">
                  <p className="text-caption text-muted">{used} used / {total} total</p>
                  <div className="w-20 h-1.5 bg-surface-card rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(usedPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave History */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
          <h3 className="text-title-sm text-ink">Leave History</h3>
          <span className="text-caption text-muted">{myLeaves.length} total</span>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-hairline bg-surface-soft/50 overflow-x-auto">
          {STATUS_FILTERS.map(tab => {
            const count = tab === 'All' ? myLeaves.length : myLeaves.filter(l => (l.status || '').toLowerCase() === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-caption font-medium transition-all whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-canvas text-ink shadow-soft'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab} <span className="text-muted ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1fr_100px_80px_100px] gap-4 px-5 py-2.5 border-b border-hairline bg-surface-soft/30">
          <span className="text-caption text-muted font-medium">Leave Details</span>
          <span className="text-caption text-muted font-medium text-center">Duration</span>
          <span className="text-caption text-muted font-medium text-center">Status</span>
          <span className="text-caption text-muted font-medium text-right">Applied On</span>
        </div>

        <div className="divide-y divide-hairline">
          {(() => {
            const filtered = statusFilter === 'All'
              ? myLeaves
              : myLeaves.filter(l => (l.status || '').toLowerCase() === statusFilter.toLowerCase());

            if (filtered.length === 0) {
              return (
                <div className="px-5 py-12 text-center">
                  <CalendarOff size={32} className="text-muted mx-auto mb-3" />
                  <p className="text-body-sm text-muted">
                    {myLeaves.length === 0 ? 'No leave requests yet.' : `No ${statusFilter.toLowerCase()} leaves.`}
                  </p>
                  {myLeaves.length === 0 && (
                    <Link to="/app/time-off/apply" className="text-body-sm text-primary hover:underline mt-2 inline-block">
                      Apply for your first leave
                    </Link>
                  )}
                </div>
              );
            }

            return filtered.map((leave) => {
              const startDate = new Date(leave.start_date);
              const endDate = new Date(leave.end_date);
              const days = Number(leave.total_days) || 1;
              const status = (leave.status || 'Pending').toLowerCase();
              return (
                <div key={leave.id} className="px-5 py-4 hover:bg-surface-soft/30 transition-colors grid grid-cols-1 sm:grid-cols-[1fr_100px_80px_100px] gap-3 sm:gap-4 items-center">
                  {/* Leave Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center flex-shrink-0">
                      <CalendarOff size={16} className="text-muted" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-ink truncate">{leave.leave_type_name || 'Leave'}</p>
                      <div className="flex items-center gap-1.5 text-caption text-muted">
                        <Calendar size={11} />
                        <span>
                          {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {days > 1 && ` → ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </span>
                      </div>
                      {leave.reason && (
                        <p className="text-caption text-muted/70 truncate mt-0.5">{leave.reason}</p>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="text-center">
                    <p className="text-body-sm font-medium text-ink">{days} day{days > 1 ? 's' : ''}</p>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <span className={`badge ${statusBadge[status] || 'badge-pending'}`}>
                      {statusLabel[status] || leave.status}
                    </span>
                  </div>

                  {/* Applied On */}
                  <div className="text-right">
                    <p className="text-caption text-muted">
                      {new Date(leave.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
