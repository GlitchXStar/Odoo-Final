import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarOff, Plus, ArrowRight, Calendar
} from 'lucide-react';
import { leaves, leaveBalances } from '../services/api.js';

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-rejected' };
const statusLabel = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled' };

export default function MyLeaves() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const [leavesRes, balancesRes] = await Promise.all([
        leaves.getAll(),
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
        <div className="px-5 py-4 border-b border-hairline">
          <h3 className="text-title-sm text-ink">Leave History</h3>
        </div>
        <div className="divide-y divide-hairline">
          {myLeaves.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CalendarOff size={32} className="text-muted mx-auto mb-3" />
              <p className="text-body-sm text-muted">No leave requests yet.</p>
              <Link to="/app/time-off/apply" className="text-body-sm text-primary hover:underline mt-2 inline-block">
                Apply for your first leave
              </Link>
            </div>
          ) : myLeaves.map((leave) => {
            const startDate = new Date(leave.start_date);
            const endDate = new Date(leave.end_date);
            const days = Number(leave.total_days) || 1;
            const status = (leave.status || 'Pending').toLowerCase();
            return (
              <div key={leave.id} className="px-5 py-4 hover:bg-surface-soft/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center flex-shrink-0">
                      <CalendarOff size={18} className="text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-body-sm font-medium text-ink">{leave.leave_type_name || 'Leave'}</p>
                        <span className={`badge ${statusBadge[status] || 'badge-pending'}`}>
                          {statusLabel[status] || leave.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-caption text-muted mb-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {days > 1 && ` → ${endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </span>
                        <span>·</span>
                        <span>{days} day{days > 1 ? 's' : ''}</span>
                      </div>
                      {leave.reason && (
                        <p className="text-caption text-muted line-clamp-2">{leave.reason}</p>
                      )}
                      <p className="text-caption text-muted/60 mt-1">
                        Applied on {new Date(leave.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
